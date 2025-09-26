"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import { useProfile } from "@/hooks/use-profile"

// Custom button component 
const NavButton = ({ 
  children, 
  href, 
  variant = "default",
  onClick,
  ...props 
}: { 
  children: React.ReactNode
  href?: string
  variant?: "default" | "outline" | "ghost"
  onClick?: () => void
  [key: string]: any
}) => {
  const baseClass = "rounded-full px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 transition-all duration-300"
  
  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    outline: "border border-gray-300 hover:border-gray-400 hover:bg-gray-50",
    ghost: "hover:bg-gray-100"
  }
  
  if (onClick) {
    return (
      <motion.button 
        className={`${baseClass} ${variants[variant]} cursor-pointer`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
  
  return (
    <Link href={href || "/"} passHref>
      <motion.div 
        className={`${baseClass} ${variants[variant]} cursor-pointer`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {children}
      </motion.div>
    </Link>
  )
}

// User avatar component with dropdown menu
const UserAvatar = ({ user, onSignOut }: { user: any, onSignOut: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Use the custom hook to fetch complete profile
  const { name: profileName, avatarUrl, loading: loadingProfile } = useProfile(user?.id)
  
  // Use profile name if available, fallback to auth metadata, then email
  const displayName = profileName || user?.user_metadata?.name || user?.email?.split('@')[0] || "User"
  const initial = displayName.charAt(0).toUpperCase()
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsOpen(false)
    }
    
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])
  
  return (
    <div className="relative">
      <motion.div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        whileHover={{ scale: 1.05 }}
      >
        <span className="text-xs text-gray-500 font-light hidden sm:inline">
          {loadingProfile ? "Loading..." : displayName}
        </span>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
            onError={(e) => {
              // If avatar fails to load, hide it and show the fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-gray-800 text-sm ${avatarUrl ? 'hidden' : ''}`}
        >
          {initial}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">
                {loadingProfile ? "Loading profile..." : displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors w-full text-left">
                Profile
              </Link>
              <button 
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  onSignOut()
                  setIsOpen(false)
                }}
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar({ currentPage = "home" }: { currentPage?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  

  

  // Add scroll detection in useEffect to prevent errors
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Add event listener inside useEffect
    window.addEventListener("scroll", handleScroll)
    
    // Initial check
    handleScroll()
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Lock body scroll when menu is open and handle keyboard shortcuts
  useEffect(() => {
    if (menuOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      // Handle escape key to close menu
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMenuOpen(false)
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      
      return () => { 
        document.body.style.overflow = original
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [menuOpen])

  return (
    <motion.header 
      className={`flex justify-between items-center px-6 py-4 sticky top-0 z-50 ${
        isScrolled ? "bg-white/80 backdrop-blur-sm" : ""
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Left: Sakura menu button */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setMenuOpen(true)} 
          aria-label="Open menu" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 border border-transparent hover:border-gray-200"
        >
          <img src="/images/flower-pattern.png" alt="menu" className="w-6 h-6" />
        </button>
      </div>
      
      {/* Center: Site name */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href="/" className="text-xl sm:text-2xl font-light tracking-wide text-gray-800 font-handwriting">
          ourlittlecorner.
        </Link>
      </div>

      {/* Right: Auth avatar */}
      <div className="flex items-center gap-3">
        {loading ? (
          // Loading state
          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        ) : user ? (
          // User is signed in - show user avatar
          <UserAvatar user={user} onSignOut={signOut} />
        ) : (
          // Show Auth navigation when logged out
          <NavButton href="/auth" variant="outline" className="text-xs font-light flex items-center">
            Sign Up / Sign In
          </NavButton>
        )}
      </div>

      

      {/* Fullscreen menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999
            }}
            // Do not close on backdrop click; only via X
          >
            {/* Close (X) icon */}
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:shadow-lg border border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-700">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <motion.div
              className="text-center space-y-10"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Link href="/albums" onClick={() => setMenuOpen(false)} className="group block font-handwriting text-6xl sm:text-7xl md:text-8xl text-gray-800 transition">
                <span className="relative inline-block">
                  Albums
                  <span className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </span>
              </Link>
              <Link href="/journals" onClick={() => setMenuOpen(false)} className="group block font-handwriting text-6xl sm:text-7xl md:text-8xl text-gray-800 transition">
                <span className="relative inline-block">
                  Journals
                  <span className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </span>
              </Link>
              <Link href="/special-days" onClick={() => setMenuOpen(false)} className="group block font-handwriting text-6xl sm:text-7xl md:text-8xl text-gray-800 transition">
                <span className="relative inline-block">
                  Special Days
                  <span className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </span>
              </Link>
              <Link href="/memory-timeline" onClick={() => setMenuOpen(false)} className="group block font-handwriting text-6xl sm:text-7xl md:text-8xl text-gray-800 transition">
                <span className="relative inline-block">
                  Timeline
                  <span className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}