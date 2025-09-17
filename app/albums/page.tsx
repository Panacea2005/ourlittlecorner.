"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/app/contexts/AuthContext"
import Link from "next/link"

type GalleryItem = {
  id: string
  name: string
  folder: string
  url: string
  path?: string
  owner?: string | null
  created_at?: string
}

export default function AlbumsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [activeFolder, setActiveFolder] = useState<string>("root")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogFolder, setDialogFolder] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogFile, setDialogFile] = useState<File | null>(null)
  const [openFolderFor, setOpenFolderFor] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)

  const filteredItems = useMemo(() => {
    let base = activeFolder === "root" ? items : items.filter((i) => i.folder === activeFolder)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      base = base.filter(i => (i.name || '').toLowerCase().includes(q))
    }
    if (startDate) {
      const sd = new Date(startDate).getTime()
      base = base.filter(i => i.created_at ? new Date(i.created_at).getTime() >= sd : true)
    }
    if (endDate) {
      const ed = new Date(endDate).getTime()
      base = base.filter(i => i.created_at ? new Date(i.created_at).getTime() <= ed : true)
    }
    return base
  }, [activeFolder, items, query, startDate, endDate])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setErrorMessage("")
      try {
        const { data, error } = await supabase
          .from('gallery_items')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        let mapped: GalleryItem[] = (data || []).map((row: any) => ({
          id: row.id,
          name: row.title || (row.path?.split('/')?.pop() || 'image'),
          folder: row.folder || 'root',
          url: row.url,
          path: row.path,
          owner: row.owner || null,
          created_at: row.created_at,
        }))
        // Validate existence in storage and purge stale metadata
        const checks = await Promise.allSettled(
          mapped.map(async (m) => {
            const res = await supabase.storage.from('gallery').createSignedUrl(m.path || '', 1)
            if ((res as any).error) {
              // Delete stale metadata
              await supabase.from('gallery_items').delete().eq('id', m.id)
              return null
            }
            return m
          })
        )
        mapped = checks
          .map((c) => (c.status === 'fulfilled' ? c.value : null))
          .filter(Boolean) as GalleryItem[]
        setItems(mapped)
        const set = new Set<string>(["root", ...mapped.map((m) => m.folder || 'root')])
        setFolders(Array.from(set))
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load gallery")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const onUpload = async (file: File, folderInput?: string, titleInput?: string) => {
    if (!file) return
    setIsUploading(true)
    setErrorMessage("")
    try {
      const folder = (folderInput ?? dialogFolder)?.trim() || "root"
      const path = `${folder}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type })
      if (upErr) throw upErr
      // Save metadata row
      const publicUrl = supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl
      await supabase.from('gallery_items').upsert({ path, title: (titleInput ?? dialogTitle) || file.name, folder, owner: user?.id ?? null, url: publicUrl }, { onConflict: 'path' })
      // Refresh listing from metadata
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      const mapped: GalleryItem[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.title || (row.path?.split('/')?.pop() || 'image'),
        folder: row.folder || 'root',
        url: row.url,
        path: row.path,
        owner: row.owner || null,
        created_at: row.created_at,
      }))
      setItems(mapped)
      const setF = new Set<string>(["root", ...mapped.map((m) => m.folder || 'root')])
      setFolders(Array.from(setF))
      setActiveFolder(folder === "root" ? "root" : folder)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload")
    } finally {
      setIsUploading(false)
      setDialogFile(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage="albums" />

      {/* Hero */}
      <div className="w-screen left-1/2 -translate-x-1/2 relative">
        <img src="/images/hero.jpg" alt="hero" className="w-full h-56 sm:h-72 md:h-80 lg:h-[24rem] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-handwriting text-4xl sm:text-6xl md:text-7xl text-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]">Our Albums</h1>
        </div>
      </div>

      {/* Controls (clean black & white) */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2">
            {folders.map((f) => (
              <button
                key={`seg-${f}`}
                onClick={() => setActiveFolder(f)}
                className={`px-3 py-1.5 text-xs rounded-full border transition ${
                  activeFolder===f ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e)=>{ setQuery(e.target.value); setPage(1) }}
              placeholder="Search titles..."
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none"
            />
            <input type="date" value={startDate} onChange={(e)=>{ setStartDate(e.target.value); setPage(1) }} className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none" />
            <span className="text-xs text-gray-500">to</span>
            <input type="date" value={endDate} onChange={(e)=>{ setEndDate(e.target.value); setPage(1) }} className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none" />
            <select value={pageSize} onChange={(e)=>{ setPageSize(parseInt(e.target.value)); setPage(1) }} className="px-2 py-1.5 text-xs border border-gray-300 rounded-full bg-white focus:outline-none">
              {[12,24,36,48].map(s => <option key={`ps-${s}`} value={s}>{s}/page</option>)}
            </select>
            <button onClick={() => setDialogOpen(true)} className="px-4 py-1.5 text-xs rounded-full border border-gray-900 text-gray-900 bg-white hover:bg-gray-50">
              {isUploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="mt-3 text-xs text-red-600">{errorMessage}</div>
        )}
      </div>

      {/* Gallery */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 text-sm">Loading gallery…</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">No images yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedItems.map((it) => (
              <motion.figure key={it.id || it.path} className="relative"
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-full">
                  <img src={it.url} alt={it.name} className="w-full h-auto object-contain" />
                </div>
                <figcaption className="mt-2">
                  <div className="text-sm text-gray-900 truncate">{it.name}</div>
                  <div className="text-[11px] text-gray-600">{it.created_at ? new Date(it.created_at).toLocaleDateString() : ''}</div>
                  <div className="mt-1 relative inline-block">
                    <button
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50"
                      onClick={() => setOpenFolderFor(openFolderFor === (it.id || it.path || '') ? null : (it.id || it.path || ''))}
                      type="button"
                    >
                      {it.folder}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {openFolderFor === (it.id || it.path || '') && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-md"
                        >
                          <div className="max-h-48 overflow-auto py-1 text-[12px]">
                            {[...new Set(folders.filter(Boolean))].map((f) => (
                              <button
                                key={`${it.id || it.path}-${f}`}
                                className={`w-full text-left px-3 py-1.5 hover:bg-gray-50 ${f===it.folder?'text-gray-900':'text-gray-700'}`}
                                onClick={async () => {
                                  const newFolder = f
                                  const fileName = (it.path || '').split('/').pop() || `${Date.now()}-${it.name}`
                                  const oldPath = it.path || `${it.folder}/${fileName}`
                                  const newPath = `${newFolder}/${fileName}`
                                  try {
                                    const { error: mvErr } = await supabase.storage.from('gallery').move(oldPath, newPath)
                                    if (mvErr) throw mvErr
                                    const newUrl = supabase.storage.from('gallery').getPublicUrl(newPath).data.publicUrl
                                    await supabase.from('gallery_items').update({ path: newPath, folder: newFolder, url: newUrl }).eq('id', it.id)
                                    setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, path: newPath, folder: newFolder, url: newUrl } : x))
                                    if (!folders.includes(newFolder)) setFolders((prev) => Array.from(new Set([...prev, newFolder])))
                                  } catch (err: any) {
                                    setErrorMessage(err.message || 'Failed to move')
                                  } finally {
                                    setOpenFolderFor(null)
                                  }
                                }}
                                type="button"
                              >
                                {f}
                              </button>
                            ))}
                            {!folders.includes('root') && (
                              <button
                                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                                onClick={async () => {
                                  const newFolder = 'root'
                                  const fileName = (it.path || '').split('/').pop() || `${Date.now()}-${it.name}`
                                  const oldPath = it.path || `${it.folder}/${fileName}`
                                  const newPath = `${newFolder}/${fileName}`
                                  try {
                                    const { error: mvErr } = await supabase.storage.from('gallery').move(oldPath, newPath)
                                    if (mvErr) throw mvErr
                                    const newUrl = supabase.storage.from('gallery').getPublicUrl(newPath).data.publicUrl
                                    await supabase.from('gallery_items').update({ path: newPath, folder: newFolder, url: newUrl }).eq('id', it.id)
                                    setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, path: newPath, folder: newFolder, url: newUrl } : x))
                                    if (!folders.includes(newFolder)) setFolders((prev) => Array.from(new Set([...prev, newFolder])))
                                  } catch (err: any) {
                                    setErrorMessage(err.message || 'Failed to move')
                                  } finally {
                                    setOpenFolderFor(null)
                                  }
                                }}
                                type="button"
                              >
                                root
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 mt-4 flex items-center justify-between text-xs text-gray-700">
        <div>
          Page {currentPage} of {totalPages} · {filteredItems.length} items
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-full border border-gray-300 bg-white disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage((p)=> Math.max(1, p-1))}
          >
            Previous
          </button>
          <button
            className="px-3 py-1.5 rounded-full border border-gray-300 bg-white disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p)=> Math.min(totalPages, p+1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Upload dialog - clean and consistent with profile */}
      <AnimatePresence>
        {dialogOpen && (
          <motion.div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center"
                       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="relative w-[92vw] max-w-lg rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-lg p-6"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
            >
              <button
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white shadow hover:shadow-md border border-gray-200 text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <h3 className="text-lg font-light text-gray-900 mb-4">Upload to Albums</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 font-light">Folder</label>
                  <div className="flex items-center gap-2">
                    <select
                      className="px-3 py-2 text-sm border-b border-gray-300 bg-transparent focus:outline-none"
                      value={dialogFolder || 'root'}
                      onChange={(e)=>setDialogFolder(e.target.value)}
                    >
                      {[...new Set(['root', ...folders.filter(f=>f!=='root')])].map((f)=> (
                        <option key={`opt-${f}`} value={f}>{f}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">or</span>
                    <input
                      value={dialogFolder}
                      onChange={(e)=>setDialogFolder(e.target.value)}
                      placeholder="Create new"
                      className="w-full bg-transparent border-b border-gray-300 px-0 py-2 text-gray-800 text-sm focus:outline-none focus:border-b-gray-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-light">Title</label>
                  <input
                    value={dialogTitle}
                    onChange={(e)=>setDialogTitle(e.target.value)}
                    placeholder="Image title"
                    className="w-full bg-transparent border-b border-gray-300 px-0 py-3 text-gray-800 text-sm focus:outline-none focus:border-b-gray-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 font-light mb-1">Image</label>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full bg-white text-gray-800 cursor-pointer hover:bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span className="text-xs">Choose file</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e)=> setDialogFile(e.target.files?.[0] || null)} />
                  </label>
                  {dialogFile && (
                    <div className="mt-3 text-xs text-gray-500">Selected: {dialogFile.name}</div>
                  )}
                </div>
                {errorMessage && (
                  <div className="text-xs text-red-600">{errorMessage}</div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button className="px-4 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50" onClick={()=>setDialogOpen(false)}>Cancel</button>
                <button
                  className="px-4 py-1.5 text-xs rounded-full border border-gray-900 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50"
                  disabled={!dialogFile || isUploading}
                  onClick={async ()=>{
                    if (!dialogFile) return
                    await onUpload(dialogFile, dialogFolder, dialogTitle)
                    setDialogOpen(false)
                    setDialogFile(null)
                    setDialogFolder("")
                    setDialogTitle("")
                  }}
                >
                  {isUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}


