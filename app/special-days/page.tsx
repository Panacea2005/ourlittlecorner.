"use client"

import { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/app/contexts/AuthContext"

type SpecialDay = {
  id: string
  user_id: string | null
  date: string // YYYY-MM-DD
  title: string | null
  note: string | null
  created_at?: string
  kind?: 'birthday' | 'anniversary' | 'other'
}

function formatDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function SpecialDaysPage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState(() => new Date())
  const [items, setItems] = useState<SpecialDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDate, setEditDate] = useState<string>("")
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [kind, setKind] = useState<'birthday' | 'anniversary' | 'other'>("other")

  const year = current.getFullYear()
  const month = current.getMonth() // 0-based
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = firstDay.getDay() // 0 Sun - 6 Sat
  const daysInMonth = lastDay.getDate()

  const byDate = useMemo(() => {
    const map = new Map<string, SpecialDay[]>()
    for (const it of items) {
      const arr = map.get(it.date) || []
      arr.push(it)
      map.set(it.date, arr)
    }
    return map
  }, [items])

  const [recurring, setRecurring] = useState<Map<string, SpecialDay[]>>(new Map()) // key: MM-DD

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const start = `${year}-${String(month + 1).padStart(2,'0')}-01`
        const end = `${year}-${String(month + 1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`
        const { data, error } = await supabase
          .from('special_days')
          .select('*')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: true })
        if (error) throw error
        setItems((data || []) as any)

        // Recurring: fetch a wider range and filter client-side by month for yearly events
        // To avoid large scans, fetch last 20 years for this month window
        const startPast = `${year - 20}-${String(month + 1).padStart(2,'0')}-01`
        const endFuture = `${year + 1}-${String(month + 1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`
        const { data: wide, error: wideErr } = await supabase
          .from('special_days')
          .select('*')
          .gte('date', startPast)
          .lte('date', endFuture)
        if (wideErr) throw wideErr
        const mm = month + 1
        const map = new Map<string, SpecialDay[]>()
        for (const it of (wide || []) as SpecialDay[]) {
          if (!(it.kind === 'birthday' || it.kind === 'anniversary')) continue
          const parts = (it.date || '').split('-')
          if (parts.length !== 3) continue
          const m = parseInt(parts[1], 10)
          const d = parts[2]
          if (m === mm) {
            const key = `${String(m).padStart(2,'0')}-${d}`
            const arr = map.get(key) || []
            arr.push(it)
            map.set(key, arr)
          }
        }
        setRecurring(map)
      } catch (e: any) {
        setError(e.message || 'Failed to load days')
        setItems([])
        setRecurring(new Map())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [year, month, daysInMonth])

  const openEditor = (dateKey: string) => {
    const existing = byDate.get(dateKey)?.[0]
    setEditDate(dateKey)
    setTitle(existing?.title || "")
    setNote(existing?.note || "")
    setKind((existing?.kind as any) || 'other')
    setDialogOpen(true)
  }

  const save = async () => {
    if (!editDate) return
    try {
      const payload: any = { date: editDate, title: title.trim() || null, note: note.trim() || null, kind }
      const existing = byDate.get(editDate)?.[0]
      if (existing) {
        const { error } = await supabase.from('special_days').update(payload).eq('id', existing.id)
        if (error) throw error
        setItems(prev => prev.map(x => x.id === existing.id ? { ...x, ...payload } as any : x))
      } else {
        const { data, error } = await supabase.from('special_days').insert(payload).select('*').single()
        if (error) throw error
        setItems(prev => [data as any, ...prev])
      }
      setDialogOpen(false)
      setEditDate("")
      setTitle("")
      setNote("")
      setKind('other')
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    }
  }

  const remove = async () => {
    if (!editDate) return
    const existing = byDate.get(editDate)?.[0]
    if (!existing) {
      setDialogOpen(false)
      return
    }
    try {
      const { error } = await supabase.from('special_days').delete().eq('id', existing.id)
      if (error) throw error
      setItems(prev => prev.filter(x => x.id !== existing.id))
      setDialogOpen(false)
      setEditDate("")
      setTitle("")
      setNote("")
      setKind('other')
    } catch (e: any) {
      setError(e.message || 'Failed to delete')
    }
  }

  const days: Array<{ key: string; dateNum: number | null }> = []
  for (let i = 0; i < startWeekday; i++) days.push({ key: `blank-${i}`, dateNum: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    days.push({ key: dateKey, dateNum: d })
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(current)
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const years = useMemo(()=>{
    const arr: number[] = []
    const base = new Date().getFullYear()
    for (let y = base - 50; y <= base + 50; y++) arr.push(y)
    return arr
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPage="special-days" />

      <div className="w-screen left-1/2 -translate-x-1/2 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="calendar" className="w-full h-56 sm:h-72 md:h-80 lg:h-[24rem] object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-handwriting text-4xl sm:text-6xl md:text-7xl text-black drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]">Special Days</h1>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl text-gray-900">{monthLabel}</div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={(e)=> setCurrent(new Date(year, Number(e.target.value), 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white">
              {months.map((m, i)=> <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={(e)=> setCurrent(new Date(Number(e.target.value), month, 1))} className="px-3 py-1.5 text-sm border border-gray-300 rounded-full bg-white">
              {years.map((y)=> <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-7 gap-2 text-xs">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=>(
            <div key={`hd-${d}`} className="text-gray-600 text-center py-2">{d}</div>
          ))}
          {days.map((d)=>{
            const dateKey = d.dateNum ? `${year}-${String(month + 1).padStart(2,'0')}-${String(d.dateNum).padStart(2,'0')}` : ""
            const isToday = d.dateNum ? formatDateKey(new Date()) === dateKey : false
            const mmdd = d.dateNum ? `${String(month + 1).padStart(2,'0')}-${String(d.dateNum).padStart(2,'0')}` : ""
            const recurringItems = d.dateNum ? (recurring.get(mmdd) || []) : []
            const has = d.dateNum ? (byDate.get(dateKey)?.[0] || recurringItems[0] || null) : null
            return (
              <button
                key={d.key}
                className={`min-h-20 sm:min-h-24 border rounded-xl p-2 text-left transition ${has ? 'border-pink-300 bg-pink-50/70 hover:bg-pink-50' : 'border-gray-200 bg-white hover:bg-gray-50'} ${isToday ? 'ring-2 ring-gray-900' : ''}`}
                onClick={()=> d.dateNum && openEditor(dateKey)}
              >
                <div className="text-[11px] text-gray-500">{d.dateNum || ''}</div>
                {(byDate.get(dateKey)?.[0]) && (
                  <div className="mt-1">
                    <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">{byDate.get(dateKey)?.[0]?.kind || 'other'}</div>
                    <div className="text-[12px] text-gray-900 truncate">{byDate.get(dateKey)?.[0]?.title || 'Special Day'}</div>
                    {byDate.get(dateKey)?.[0]?.note && <div className="text-[11px] text-gray-600 line-clamp-2">{byDate.get(dateKey)?.[0]?.note}</div>}
                  </div>
                )}
                {(!byDate.get(dateKey)?.[0] && recurringItems.length > 0) && (
                  <div className="mt-1">
                    <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">recurs</div>
                    <div className="text-[12px] text-gray-900 truncate">{recurringItems[0]?.title || 'Special Day'}</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-gray-600">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-pink-100 border border-pink-300" /> exact day</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300" /> yearly (birthday/anniversary)</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-300" /> normal</span>
        </div>

        {/* Editor dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-800">{editDate}</div>
                <button onClick={()=> setDialogOpen(false)} className="p-1 rounded hover:bg-gray-50">×</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600">Title</label>
                  <input value={title} onChange={(e)=> setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm" placeholder="Anniversary, Birthday, …" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Note</label>
                  <textarea value={note} onChange={(e)=> setNote(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm" rows={4} placeholder="Write a memory or plan…" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="kind" checked={kind==='other'} onChange={()=> setKind('other')} /> other
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="kind" checked={kind==='birthday'} onChange={()=> setKind('birthday')} /> birthday (repeats yearly)
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="kind" checked={kind==='anniversary'} onChange={()=> setKind('anniversary')} /> anniversary (repeats yearly)
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button onClick={remove} className="px-3 py-1.5 text-xs rounded-full border border-red-300 text-red-600 bg-white">Remove</button>
                <div className="flex items-center gap-2">
                  <button onClick={()=> setDialogOpen(false)} className="px-3 py-1.5 text-xs rounded-full border border-gray-300 text-gray-700 bg-white">Cancel</button>
                  <button onClick={save} className="px-3 py-1.5 text-xs rounded-full border border-gray-900 text-gray-900 bg-white">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}


