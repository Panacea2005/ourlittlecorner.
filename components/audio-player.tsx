"use client"

import { useEffect, useRef, useState } from "react"

type AudioPlayerProps = {
  src?: string | null
  title?: string
  subtitle?: string
  coverUrl?: string
}

export default function AudioPlayer({ src, title, subtitle, coverUrl }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setProgress(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration || 0)
    const onEnded = () => setIsPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    // Stop playback when source changes
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
  }, [src])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || !src) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (e) {
        // ignore
      }
    }
  }

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const value = Number(e.target.value)
    audio.currentTime = value
    setProgress(value)
  }

  return (
    <div className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white/80">
      <audio ref={audioRef} src={src || undefined} preload="none" />
      <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">♪</div>
        )}
      </div>
      <button
        onClick={toggle}
        disabled={!src}
        className="w-9 h-9 rounded-full border border-gray-300 bg-white text-gray-800 disabled:opacity-50 flex items-center justify-center"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        type="button"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-900 truncate">{title || 'Preview'}</div>
        <div className="text-[11px] text-gray-500 truncate">{subtitle}</div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="range"
            min={0}
            max={duration || 30}
            step={0.1}
            value={progress}
            onChange={onSeek}
            className="w-full accent-gray-800"
          />
          <div className="text-[10px] text-gray-500 w-10 text-right">
            {Math.floor(progress)}s
          </div>
        </div>
      </div>
    </div>
  )
}


