"use client"

import { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SongPreview from "@/components/song-preview"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/app/contexts/AuthContext"

type Journal = {
  id: string
  author: string | null
  title: string | null
  content: string | null
  cover_url: string | null
  spotify_track_id: string | null
  spotify_track_name: string | null
  spotify_artists: string | null
  spotify_image: string | null
  spotify_preview_url: string | null
  created_at?: string
}

type TrackLite = {
  id: string
  name: string
  artists: string
  image?: string
  preview_url?: string | null
}

export default function JournalsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Create dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // Cover removed; we'll theme by track image
  const [trackQuery, setTrackQuery] = useState("")
  const [trackResults, setTrackResults] = useState<TrackLite[]>([])
  const [selectedTrack, setSelectedTrack] = useState<TrackLite | null>(null)

  const [viewOpen, setViewOpen] = useState<Journal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const { data, error } = await supabase
          .from('journals')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        const list = ((data || []) as any as Journal[]).filter(j => (j.title && j.title.trim()) || (j.content && j.content.trim()))
        setItems(list)
      } catch (e: any) {
        setError(e.message || 'Failed to load journals')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // No cover upload

  const searchTrack = async () => {
    if (!trackQuery.trim()) return
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(trackQuery.trim())}`)
      const json = await res.json()
      const arr = (json.items || []).map((t: any) => ({ id: t.id, name: t.name, artists: t.artists, image: t.image, preview_url: t.preview_url })) as TrackLite[]
      setTrackResults(arr)
    } catch {}
  }

  const saveJournal = async () => {
    try {
      if (!selectedTrack) throw new Error('Please select a song')
      if (!(title.trim() || content.trim())) throw new Error('Please add a title or some content')
      const payload: Partial<Journal> = {
        title: title.trim() || null,
        content: content.trim() || null,
        cover_url: selectedTrack?.image || null,
        spotify_track_id: selectedTrack?.id || null,
        spotify_track_name: selectedTrack?.name || null,
        spotify_artists: selectedTrack?.artists || null,
        spotify_image: selectedTrack?.image || null,
        spotify_preview_url: selectedTrack?.preview_url || null,
      }
      if (editId) {
        const { data, error } = await supabase.from('journals').update(payload).eq('id', editId).select('*').single()
        if (error) throw error
        setItems(prev => prev.map(j => j.id === editId ? (data as any) : j))
      } else {
        const { data, error } = await supabase.from('journals').insert(payload).select('*').single()
        if (error) throw error
        setItems(prev => [data as any, ...prev])
      }
      setDialogOpen(false)
      setEditId(null)
      setTitle("")
      setContent("")
      
      setTrackQuery("")
      setTrackResults([])
      setSelectedTrack(null)
    } catch (e: any) {
      setError(e.message || 'Failed to save note')
    }
  }

  const deleteJournal = async (id: string) => {
    try {
      setDeleting(true)
      const { error } = await supabase.from('journals').delete().eq('id', id)
      if (error) throw error
      setItems(prev => prev.filter(x => x.id !== id))
      setViewOpen(null)
    } catch (e: any) {
      setError(e.message || 'Failed to delete note')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage="journals" />

      <div className="w-screen left-1/2 -translate-x-1/2 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="journals" className="w-full h-56 sm:h-72 md:h-80 lg:h-[24rem] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-handwriting text-4xl sm:text-6xl md:text-7xl text-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]">Journals</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl text-gray-900">Notes</div>
          <button className="px-4 py-1.5 text-sm rounded-full border border-gray-900 text-gray-900 bg-white" onClick={()=> setDialogOpen(true)}>New</button>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="py-20 text-center text-gray-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">No notes yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((it)=> (
              <div key={it.id} className="text-left group cursor-pointer" onClick={()=> setViewOpen(it)}>
                <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-gray-200 bg-white relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.cover_url ? (
                    <img src={it.cover_url} alt={it.title || 'cover'} className="w-full h-full object-cover group-hover:scale-[1.03] transition" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="font-handwriting text-2xl text-white drop-shadow truncate">{it.title || (it.content ? it.content.slice(0, 18) + (it.content.length>18?'…':'') : 'Note')}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/90 text-gray-800">
                      <span className="truncate max-w-[180px]">{it.spotify_track_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={()=> { setDialogOpen(false); setEditId(null) }}>
          <div className="w-full max-w-3xl rounded-2xl bg-white overflow-hidden border border-gray-200 relative" onClick={(e)=> e.stopPropagation()}>
            {/* Themed header */}
            <div className="h-48 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {selectedTrack?.image && <img src={selectedTrack.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white" />
              <button onClick={()=> { setDialogOpen(false); setEditId(null) }} className="absolute top-3 right-3 p-2 rounded-full bg-white shadow border border-gray-200">×</button>
            </div>
            <div className="p-6 -mt-24 relative">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-md">
                <div className="space-y-3">
                  <input
                    value={title}
                    onChange={(e)=> setTitle(e.target.value)}
                    placeholder="A note title"
                    className="w-full px-3 py-2 bg-transparent border-b border-gray-300 focus:outline-none text-2xl font-handwriting text-gray-900"
                  />
                  <SongPreview
                    trackId={selectedTrack?.id}
                    name={selectedTrack?.name}
                    artists={selectedTrack?.artists}
                    image={selectedTrack?.image}
                    previewUrl={selectedTrack?.preview_url}
                  />
                </div>
              </div>
              <div className="mt-6">
                <textarea
                  value={content}
                  onChange={(e)=> setContent(e.target.value)}
                  placeholder="Write your note…"
                  className="w-full px-0 py-0 bg-transparent border-0 focus:outline-none text-lg text-gray-800 font-handwriting leading-relaxed min-h-[160px]"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={()=> { setDialogOpen(false); setEditId(null) }} className="px-4 py-2 text-xs rounded-full border border-gray-300 text-gray-700 bg-white">Cancel</button>
                <button onClick={saveJournal} disabled={!selectedTrack || !(title.trim() || content.trim())} className="px-4 py-2 text-xs rounded-full border border-gray-900 text-gray-900 bg-white disabled:opacity-50">{editId ? 'Save' : 'Create'}</button>
              </div>
              <div className="mt-6">
                <div className="text-[11px] text-gray-500 mb-1">Pick a Spotify song</div>
                <div className="flex items-center gap-2">
                  <input value={trackQuery} onChange={(e)=> setTrackQuery(e.target.value)} placeholder="Search songs…" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white" />
                  <button onClick={searchTrack} className="px-4 py-2 text-sm rounded-xl border border-gray-900 text-gray-900 bg-white">Search</button>
                </div>
                {!selectedTrack && (
                  <div className="max-h-56 overflow-auto mt-2 grid grid-cols-1 gap-2">
                    {trackResults.map((t)=> (
                      <div key={t.id} onClick={()=> setSelectedTrack(t)} className="cursor-pointer">
                        <SongPreview trackId={t.id} name={t.name} artists={t.artists} image={t.image} previewUrl={t.preview_url} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={()=> setViewOpen(null)}>
          <div className="w-full max-w-3xl rounded-2xl bg-white overflow-hidden border border-gray-200 relative" onClick={(e)=> e.stopPropagation()}>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {user?.id && viewOpen.author === user.id && (
                <>
                  <button onClick={()=>{
                    setDialogOpen(true)
                    setEditId(viewOpen.id)
                    setTitle(viewOpen.title || '')
                    setContent(viewOpen.content || '')
                    setSelectedTrack({ id: viewOpen.spotify_track_id || '', name: viewOpen.spotify_track_name || '', artists: viewOpen.spotify_artists || '', image: viewOpen.spotify_image || '', preview_url: viewOpen.spotify_preview_url || '' })
                  }} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-800 bg-white">Edit</button>
                  <button disabled={deleting} onClick={()=> deleteJournal(viewOpen.id)} className="px-3 py-1.5 text-xs rounded-full border border-red-300 text-red-600 bg-white disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete'}</button>
                </>
              )}
              <button onClick={()=> setViewOpen(null)} className="p-2 rounded-full bg-white shadow border border-gray-200">×</button>
            </div>
            {/* Themed header using song/cover image */}
            <div className="h-48 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {viewOpen.cover_url && <img src={viewOpen.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white" />
            </div>
            <div className="p-6 -mt-24 relative">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-4 shadow-md">
                <div className="font-handwriting text-3xl text-gray-900 mb-1">{viewOpen.title || 'Untitled'}</div>
                <div className="text-xs text-gray-500 mb-4">by {viewOpen.author ? 'someone' : 'anonymous'}</div>
                <SongPreview
                  trackId={viewOpen.spotify_track_id}
                  name={viewOpen.spotify_track_name}
                  artists={viewOpen.spotify_artists}
                  image={viewOpen.spotify_image}
                  previewUrl={viewOpen.spotify_preview_url}
                />
              </div>
              <div className="mt-6 whitespace-pre-wrap text-base text-gray-800 font-light leading-relaxed font-handwriting">{viewOpen.content}</div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}


