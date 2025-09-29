"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { ProfileService } from '@/lib/services/profileService'
import { supabase } from '@/lib/supabase/supabaseClient'

// Use shared Supabase client to avoid multiple GoTrueClient instances

interface AuthContextProps {
  session: Session | null
  user: User | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  updateEmail: (newEmail: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to ensure user has a profile (non-blocking)
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error } = await ProfileService.getProfile(user.id)
      
      // If there's an error other than "no profile found", log it but don't block
      if (error && error.code !== 'PGRST116') {
        console.warn('Error checking for existing profile (non-blocking):', error)
        // Don't block the app, just log the warning
        return
      }
      
      // If no profile exists, create one
      if (!existingProfile) {
        const name = user.user_metadata?.name || user.email?.split('@')[0] || ''
        const { error: createError } = await ProfileService.createProfile(
          user.id,
          user.email || '',
          name
        )
        
        if (createError) {
          console.warn('Error creating user profile (non-blocking):', createError)
          // Don't block the app, profile can be created later
        } else {
          console.log('Profile created successfully for user:', user.id)
        }
      }
    } catch (error) {
      console.warn('Unexpected error in ensureUserProfile (non-blocking):', error)
      // Don't block the app, just log the warning
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        // IMPORTANT: Set loading to false BEFORE profile operations
        setLoading(false)
        
        // Ensure profile exists for the user (non-blocking)
        if (session?.user) {
          // Run this in the background without awaiting
          ensureUserProfile(session.user).catch(err => {
            console.warn('Profile creation failed in background:', err)
          })
        }
      } catch (error) {
        console.error('Unexpected error during getSession:', error)
        // Always set loading to false even if there's an error
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Ensure profile exists when user signs in or signs up (non-blocking)
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Run this in the background without blocking the UI
          ensureUserProfile(session.user).catch(err => {
            console.warn('Profile creation failed during auth state change:', err)
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Direct sign-up without email confirmation requirement
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
          },
        },
      })
      
      // Profile creation handled by auth state change listener on sign-in
      
      return { error }
    } catch (error: any) {
      console.error('Error during signup:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      return { error }
    } catch (error: any) {
      console.error('Error during signin:', error)
      return { error }
    }
  }

  // Social OAuth removed

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error during signout:', error)
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      return { error }
    } catch (error: any) {
      console.error('Error during password update:', error)
      return { error }
    }
  }

  const updateEmail = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      return { error }
    } catch (error: any) {
      console.error('Error during email update:', error)
      return { error }
    }
  }

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    updatePassword,
    updateEmail,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}