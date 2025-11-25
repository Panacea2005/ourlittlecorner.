"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Download, Save, RotateCcw, Palette, Image as ImageIcon, Sparkles, Grid, Layout, Timer, Play, ArrowRight, ArrowLeft, Check, Heart, Circle, Square, Flower2, Film, Star, Sparkle, Zap, Music, Smile } from "lucide-react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useAuth } from "@/app/contexts/AuthContext"
import { toast } from "sonner"

type FrameType = 'polaroid' | 'heart' | 'vintage' | 'modern' | 'rounded' | 'ornate' | 'minimal' | 'floral'
type LayoutType = 'single' | 'vertical-2' | 'vertical-3' | 'vertical-4' | 'grid-2x2' | 'grid-3x3'
type WorkflowStep = 'layout' | 'capture' | 'edit' | 'preview'

type FilterPreset = 'none' | 'vintage' | 'warm' | 'cool' | 'bright' | 'soft' | 'dramatic' | 'blackwhite'

interface FrameData {
  type: FrameType
  frameColor: string
  frameWidth: number
  filterPreset: FilterPreset
}

interface LayoutConfig {
  type: LayoutType
  label: string
  icon: React.ReactNode
  grid: { rows: number; cols: number }
  previewIcon: React.ReactNode
}

const LAYOUTS: LayoutConfig[] = [
  { type: 'single', label: 'Single', icon: <ImageIcon className="w-6 h-6" />, grid: { rows: 1, cols: 1 }, previewIcon: <Camera className="w-8 h-8" /> },
  { type: 'vertical-2', label: 'Vertical 2', icon: <Layout className="w-6 h-6" />, grid: { rows: 2, cols: 1 }, previewIcon: <div className="flex flex-col gap-1"><Camera className="w-6 h-6" /><Camera className="w-6 h-6" /></div> },
  { type: 'vertical-3', label: 'Vertical 3', icon: <Layout className="w-6 h-6" />, grid: { rows: 3, cols: 1 }, previewIcon: <div className="flex flex-col gap-1"><Camera className="w-5 h-5" /><Camera className="w-5 h-5" /><Camera className="w-5 h-5" /></div> },
  { type: 'vertical-4', label: 'Vertical 4', icon: <Layout className="w-6 h-6" />, grid: { rows: 4, cols: 1 }, previewIcon: <div className="flex flex-col gap-0.5"><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /></div> },
  { type: 'grid-2x2', label: 'Grid 2x2', icon: <Grid className="w-6 h-6" />, grid: { rows: 2, cols: 2 }, previewIcon: <div className="grid grid-cols-2 gap-1"><Camera className="w-5 h-5" /><Camera className="w-5 h-5" /><Camera className="w-5 h-5" /><Camera className="w-5 h-5" /></div> },
  { type: 'grid-3x3', label: 'Grid 3x3', icon: <Grid className="w-6 h-6" />, grid: { rows: 3, cols: 3 }, previewIcon: <div className="grid grid-cols-3 gap-0.5"><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /><Camera className="w-4 h-4" /></div> },
]

const FRAME_TYPES: { value: FrameType; label: string; previewIcon: React.ReactNode }[] = [
  { value: 'polaroid', label: 'Polaroid', previewIcon: <Camera className="w-6 h-6" /> },
  { value: 'heart', label: 'Heart', previewIcon: <Heart className="w-6 h-6" /> },
  { value: 'vintage', label: 'Vintage', previewIcon: <Film className="w-6 h-6" /> },
  { value: 'modern', label: 'Modern', previewIcon: <Sparkles className="w-6 h-6" /> },
  { value: 'rounded', label: 'Rounded', previewIcon: <Circle className="w-6 h-6" /> },
  { value: 'ornate', label: 'Ornate', previewIcon: <Palette className="w-6 h-6" /> },
  { value: 'minimal', label: 'Minimal', previewIcon: <Square className="w-6 h-6" /> },
  { value: 'floral', label: 'Floral', previewIcon: <Flower2 className="w-6 h-6" /> },
]

const FRAME_COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#f3f4f6', label: 'Gray' },
  { value: '#fef3c7', label: 'Cream' },
  { value: '#fce7f3', label: 'Pink' },
  { value: '#e0e7ff', label: 'Lavender' },
  { value: '#dbeafe', label: 'Blue' },
  { value: '#d1fae5', label: 'Mint' },
  { value: '#fef2f2', label: 'Rose' },
  { value: '#fef9c3', label: 'Yellow' },
  { value: '#ede9fe', label: 'Purple' },
]

export default function PhotoboothPage() {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const captureIndexRef = useRef(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('layout')
  const [selectedLayout, setSelectedLayout] = useState<LayoutType | null>(null)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0)
  const [captureMode, setCaptureMode] = useState<'manual' | 'auto'>('manual')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [frameData, setFrameData] = useState<FrameData>({
    type: 'polaroid',
    frameColor: '#ffffff',
    frameWidth: 40,
    filterPreset: 'none',
  })

  // Filter presets
  const FILTER_PRESETS: { value: FilterPreset; label: string; filter: string }[] = [
    { value: 'none', label: 'None', filter: 'none' },
    { value: 'vintage', label: 'Vintage', filter: 'sepia(30%) contrast(110%) brightness(95%)' },
    { value: 'warm', label: 'Warm', filter: 'sepia(20%) saturate(120%) brightness(105%)' },
    { value: 'cool', label: 'Cool', filter: 'hue-rotate(180deg) saturate(80%) brightness(100%)' },
    { value: 'bright', label: 'Bright', filter: 'brightness(120%) contrast(110%) saturate(110%)' },
    { value: 'soft', label: 'Soft', filter: 'brightness(105%) contrast(95%) saturate(90%) blur(0.5px)' },
    { value: 'dramatic', label: 'Dramatic', filter: 'contrast(130%) brightness(90%) saturate(120%)' },
    { value: 'blackwhite', label: 'B&W', filter: 'grayscale(100%) contrast(110%)' },
  ]

  // Emoji icons for frame decoration
  const EMOJI_ICONS = ['🌸', '✨', '💕', '💖', '⭐', '🌺', '🌷', '🌼', '💐', '🦋', '💫', '🌟', '💝', '🌹', '🌻', '🌿']

  const totalPhotos = selectedLayout ? LAYOUTS.find(l => l.type === selectedLayout)?.grid.rows! * LAYOUTS.find(l => l.type === selectedLayout)?.grid.cols! : 1

  // Start webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        }
      })
      setStream(mediaStream)
    } catch (error) {
      console.error('Error accessing webcam:', error)
      toast.error('Could not access webcam. Please check permissions.')
    }
  }

  // Update video element when stream changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err)
      })
    } else if (!stream && videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get actual video dimensions to maintain aspect ratio
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight
    
    // Set canvas to match video dimensions exactly
    canvas.width = videoWidth
    canvas.height = videoHeight

    // Flip the image horizontally to match the mirrored preview
    ctx.translate(videoWidth, 0)
    ctx.scale(-1, 1)
    
    // Draw video maintaining its natural aspect ratio
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const imageData = canvas.toDataURL('image/png')
    
    setCapturedImages(prev => {
      const newImages = [...prev]
      newImages[currentCaptureIndex] = imageData
      return newImages
    })
    
    setIsCapturing(true)
    
    // Auto advance or move to next photo (only for manual mode)
    // Auto mode handles its own progression via startAutoCapture
    if (captureMode === 'manual') {
      if (currentCaptureIndex < totalPhotos - 1) {
        setTimeout(() => {
          const nextIdx = currentCaptureIndex + 1
          captureIndexRef.current = nextIdx
          setCurrentCaptureIndex(nextIdx)
          setIsCapturing(false)
        }, 1500)
      } else {
        setTimeout(() => {
          setIsCapturing(false)
          setCurrentStep('edit')
        }, 1500)
      }
    } else {
      // In auto mode, startAutoCapture will handle progression
      setTimeout(() => {
        setIsCapturing(false)
      }, 1500)
    }
  }, [currentCaptureIndex, totalPhotos, captureMode])

  // Auto capture with countdown
  const startAutoCapture = useCallback(() => {
    const captureIndex = captureIndexRef.current
    
    // Check if we're done
    if (captureIndex >= totalPhotos) {
      setCurrentStep('edit')
      return
    }
    
    // Start countdown
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval)
          setCountdown(null)
          
          // Capture after countdown
          setTimeout(() => {
            if (videoRef.current && canvasRef.current) {
              const video = videoRef.current
              const canvas = canvasRef.current
              const ctx = canvas.getContext('2d')
              if (ctx) {
                const videoWidth = video.videoWidth
                const videoHeight = video.videoHeight
                canvas.width = videoWidth
                canvas.height = videoHeight
                
                // Flip the image horizontally to match the mirrored preview
                ctx.translate(videoWidth, 0)
                ctx.scale(-1, 1)
                ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
                ctx.setTransform(1, 0, 0, 1, 0, 0)
                const imageData = canvas.toDataURL('image/png')
                
                // Save image at the current index
                setCapturedImages(prev => {
                  const newImages = [...prev]
                  newImages[captureIndex] = imageData
                  return newImages
                })
                
                setIsCapturing(true)
                
                // After capture, move to next or finish
                setTimeout(() => {
                  setIsCapturing(false)
                  
                  // Check if we need to continue
                  if (captureIndex < totalPhotos - 1) {
                    // Move to next photo
                    const nextIdx = captureIndex + 1
                    captureIndexRef.current = nextIdx
                    setCurrentCaptureIndex(nextIdx)
                    
                    // Start next capture after a delay
                    setTimeout(() => {
                      startAutoCapture()
                    }, 800)
                  } else {
                    // All photos captured, go to edit
                    setCurrentStep('edit')
                  }
                }, 1000)
              }
            }
          }, 300)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }, [totalPhotos])

  // Just return the original image - frame will be drawn in combineLayout
  const getOriginalImage = useCallback((imageSrc: string): Promise<string> => {
    return Promise.resolve(imageSrc)
  }, [])

  // Combine all images into layout with frame as card component
  const combineLayout = useCallback(async (forSave: boolean = false): Promise<string> => {
    if (!selectedLayout || capturedImages.length === 0 || !capturedImages.some(img => img)) return ''

    const layout = LAYOUTS.find(l => l.type === selectedLayout)!
    const { rows, cols } = layout.grid

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Get first image to determine aspect ratio
    const firstImg = new Image()
    await new Promise((resolve) => {
      firstImg.onload = resolve
      firstImg.src = capturedImages.find(img => img) || ''
    })
    
    // Maintain original aspect ratio
    const originalAspectRatio = firstImg.width / firstImg.height
    
    // Calculate dimensions - larger size for saving, smaller for preview
    const maxSingleWidth = forSave ? 800 : 150
    const maxSingleHeight = forSave ? 1200 : 200
    let singleImageWidth = maxSingleWidth
    let singleImageHeight = maxSingleWidth / originalAspectRatio
    
    if (singleImageHeight > maxSingleHeight) {
      singleImageHeight = maxSingleHeight
      singleImageWidth = maxSingleHeight * originalAspectRatio
    }
    
    // Frame padding: use frameWidth from frameData
    const sidePadding = frameData.frameWidth
    const topPadding = frameData.frameWidth
    const bottomPadding = frameData.frameWidth // Same as top since text is outside

    // Calculate total canvas size
    const displayWidth = (singleImageWidth + sidePadding * 2) * cols
    const displayHeight = (singleImageHeight + topPadding + bottomPadding) * rows
    
    // Use high DPR for sharp images
    const dpr = window.devicePixelRatio || 2
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    
    // Scale context for high DPI
    ctx.scale(dpr, dpr)

    // Draw frame card background with exact color
    ctx.fillStyle = frameData.frameColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Get filter preset
    const filterPreset = FILTER_PRESETS.find(p => p.value === frameData.filterPreset)
    const filterCSS = filterPreset?.filter || 'none'

    // Draw each image with frame - simple approach
    for (let i = 0; i < capturedImages.length; i++) {
      if (!capturedImages[i]) continue

      const row = Math.floor(i / cols)
      const col = i % cols
      const frameX = col * (singleImageWidth + sidePadding * 2)
      const frameY = row * (singleImageHeight + topPadding + bottomPadding)
      const frameWidth = singleImageWidth + sidePadding * 2
      const frameHeight = singleImageHeight + topPadding + bottomPadding

      // Draw frame background with exact color
      ctx.fillStyle = frameData.frameColor
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight)

      // Load original image
      const img = new Image()
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.save()
          
          // Enable high quality rendering FIRST
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Apply filter if needed
          if (filterCSS !== 'none') {
            ctx.filter = filterCSS
          }
          
          // Calculate image position - maintain aspect ratio
          const imageX = frameX + sidePadding
          const imageY = frameY + topPadding
          const imageWidth = singleImageWidth
          const imageHeight = singleImageHeight
          
          // Draw image directly with high quality - use original image for sharpness
          ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight)
          
          ctx.restore()
          resolve(null)
        }
        img.src = capturedImages[i]
      })
    }

    // No text/logo on canvas - will be displayed as HTML text below
    return canvas.toDataURL('image/png', 1.0)
  }, [selectedLayout, capturedImages, frameData])

  // No need to generate preview image - we'll use HTML components

  // Save to albums
  const saveToAlbums = async () => {
    if (!selectedLayout || capturedImages.length === 0 || !user) {
      toast.error('Please complete all steps first')
      return
    }

    setIsSaving(true)
    try {
      const finalImage = await combineLayout(true) // Pass true to generate larger image for saving
      if (!finalImage) throw new Error('Failed to combine images')

      // Convert to blob
      const response = await fetch(finalImage)
      const blob = await response.blob()
      const file = new File([blob], `photobooth-${Date.now()}.png`, { type: 'image/png' })

      // Upload to Supabase
      const folder = 'photobooth'
      const path = `${folder}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png',
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // Generate a nice title based on layout and date
      const layoutNames: Record<string, string> = {
        'single': 'Single Photo',
        'vertical-2': 'Double Strip',
        'vertical-3': 'Triple Strip',
        'vertical-4': 'Quad Strip',
        'grid-2x2': 'Photo Grid',
        'grid-3x3': 'Photo Mosaic',
      }
      const layoutName = layoutNames[selectedLayout] || 'Photobooth'
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const title = `${layoutName} • ${dateStr}`

      // Save metadata
      const { error: dbError } = await supabase.from('gallery_items').insert({
        path,
        title,
        folder: 'photobooth',
        owner: user.id,
        url: publicUrl,
        frame_data: {
          type: frameData.type,
          frameColor: frameData.frameColor,
          frameWidth: frameData.frameWidth,
          filterPreset: frameData.filterPreset,
          layout: selectedLayout,
          imageCount: capturedImages.filter(img => img).length,
        },
      })

      if (dbError) throw dbError

      toast.success('Photo saved to albums!')
      
      // Reset
      setCurrentStep('layout')
      setSelectedLayout(null)
      setCapturedImages([])
      captureIndexRef.current = 0
      setCurrentCaptureIndex(0)
      stopWebcam()
    } catch (error: any) {
      console.error('Error saving photo:', error)
      toast.error(error.message || 'Failed to save photo')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFrameData(prev => ({
      ...prev,
      filterPreset: 'none',
    }))
  }

  // Start capture workflow
  const startCapture = () => {
    if (!selectedLayout) return
    setCurrentStep('capture')
    setCapturedImages(new Array(totalPhotos).fill(''))
    captureIndexRef.current = 0
    setCurrentCaptureIndex(0)
    startWebcam()
  }

  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPage="photobooth" />

      {/* Title Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-handwriting text-3xl sm:text-5xl md:text-6xl text-black">
            Photobooth
          </h1>
          <p className="mt-2 text-gray-600 text-base sm:text-lg font-light">
            Capture memories with beautiful frames
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-1">
        <AnimatePresence mode="wait">
          {/* Step 1: Layout Selection */}
          {currentStep === 'layout' && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Choose Layout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {LAYOUTS.map((layout) => (
                      <motion.button
                        key={layout.type}
                        onClick={() => setSelectedLayout(layout.type)}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          selectedLayout === layout.type
                            ? 'border-black bg-gray-50 scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {layout.icon}
                          <span className="font-medium">{layout.label}</span>
                        </div>
                        <div className="mb-2 flex items-center justify-center">
                          {layout.previewIcon}
                        </div>
                        <div className="text-xs text-gray-500">
                          {layout.grid.rows * layout.grid.cols} photo{layout.grid.rows * layout.grid.cols > 1 ? 's' : ''}
                        </div>
                        {selectedLayout === layout.type && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <Check className="w-5 h-5 text-black" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {selectedLayout && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex justify-end"
                    >
                      <Button onClick={startCapture} size="lg" className="gap-2">
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Capture */}
          {currentStep === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Capture Photos ({currentCaptureIndex + 1}/{totalPhotos})
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        stopWebcam()
                        setCurrentStep('layout')
                        setCapturedImages([])
                        captureIndexRef.current = 0
                        setCurrentCaptureIndex(0)
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Capture Mode Selection */}
                  {currentCaptureIndex === 0 && capturedImages.every(img => !img) && (
                    <div className="flex gap-4 mb-6">
                      <Button
                        variant={captureMode === 'manual' ? 'default' : 'outline'}
                        onClick={() => setCaptureMode('manual')}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Manual
                      </Button>
                      <Button
                        variant={captureMode === 'auto' ? 'default' : 'outline'}
                        onClick={() => {
                          setCaptureMode('auto')
                          startAutoCapture()
                        }}
                        className="flex-1"
                      >
                        <Timer className="w-4 h-4 mr-2" />
                        Auto
                      </Button>
                    </div>
                  )}

                  {/* Split Layout: Webcam Left, Preview Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Camera Preview */}
                    <div className="space-y-4">
                      {!stream && (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <Button onClick={startWebcam} className="gap-2">
                            <Camera className="w-4 h-4" />
                            Start Camera
                          </Button>
                        </div>
                      )}

                      {stream && (
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-contain"
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              transform: 'scaleX(-1)'
                            }}
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                videoRef.current.play().catch(err => {
                                  console.error('Error playing video:', err)
                                })
                              }
                            }}
                          />
                          
                          {/* Countdown Overlay */}
                          {countdown !== null && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
                            >
                              <motion.div
                                key={countdown}
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                className="text-white text-9xl font-bold"
                              >
                                {countdown}
                              </motion.div>
                            </motion.div>
                          )}

                          {/* Flash Effect */}
                          {isCapturing && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0] }}
                              className="absolute inset-0 bg-white z-10"
                            />
                          )}

                          {/* Capture Button */}
                          {!countdown && captureMode === 'manual' && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                              <Button
                                onClick={capturePhoto}
                                size="lg"
                                className="rounded-full w-16 h-16 bg-white text-black hover:bg-gray-100 shadow-lg"
                                disabled={isCapturing}
                              >
                                <Camera className="w-6 h-6" />
                              </Button>
                            </div>
                          )}

                          {/* Progress Indicator */}
                          <div className="absolute top-4 left-4 right-4 z-10">
                            <div className="flex gap-2">
                              {Array.from({ length: totalPhotos }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 h-2 rounded-full ${
                                    i < currentCaptureIndex
                                      ? 'bg-green-500'
                                      : i === currentCaptureIndex
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Captured Images Preview */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Captured Photos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {capturedImages.map((img, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-lg overflow-hidden border-2 relative ${
                              i === currentCaptureIndex ? 'border-blue-500 ring-2 ring-blue-300' : img ? 'border-green-500' : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            {img ? (
                              <>
                                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center font-handwriting">
                                  Photo {i + 1}
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                  <div className="text-2xl mb-1">{i + 1}</div>
                                  <div className="text-xs">Waiting...</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Edit */}
          {currentStep === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Preview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Preview
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentStep('capture')
                          captureIndexRef.current = 0
                          setCurrentCaptureIndex(0)
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {capturedImages.some(img => img) ? (
                      <div className="space-y-4">
                        {/* Frame card component with images */}
                        <div 
                          className="rounded-lg overflow-hidden"
                          style={{ 
                            backgroundColor: frameData.frameColor,
                            padding: `${frameData.frameWidth}px`,
                          }}
                        >
                          <div 
                            className="grid gap-0"
                            style={{
                              gridTemplateColumns: `repeat(${LAYOUTS.find(l => l.type === selectedLayout)?.grid.cols || 1}, 1fr)`,
                              gridTemplateRows: `repeat(${LAYOUTS.find(l => l.type === selectedLayout)?.grid.rows || 1}, 1fr)`,
                            }}
                          >
                            {capturedImages.map((imgSrc, i) => {
                              if (!imgSrc) return null
                              const filterPreset = FILTER_PRESETS.find(p => p.value === frameData.filterPreset)
                              const filterCSS = filterPreset?.filter || 'none'
                              
                              return (
                                <div
                                  key={i}
                                  className="relative"
                                  style={{
                                    padding: `${frameData.frameWidth}px`,
                                  }}
                                >
                                  <img
                                    src={imgSrc}
                                    alt={`Photo ${i + 1}`}
                                    className="w-full h-auto object-cover"
                                    style={{
                                      filter: filterCSS,
                                      display: 'block',
                                    }}
                                  />
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {/* Text below preview */}
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center gap-2 font-handwriting text-xl text-black">
                            <span>ourlittlecorner.</span>
                            <img 
                              src="/images/flower-pattern.png" 
                              alt="Logo" 
                              className="w-5 h-5"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-gray-400">No images captured</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Frame Color */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-4 h-4" />
                      Frame Color
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {FRAME_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setFrameData(prev => ({ ...prev, frameColor: color.value }))}
                          className={`w-full h-12 rounded-lg border-2 transition-all ${
                            frameData.frameColor === color.value
                              ? 'border-black scale-110'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Frame Width</label>
                      <Slider
                        value={[frameData.frameWidth]}
                        onValueChange={([value]) =>
                          setFrameData(prev => ({ ...prev, frameWidth: value }))
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                      <div className="text-xs text-gray-500 text-center">
                        {frameData.frameWidth}px
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Image Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="w-4 h-4" />
                      Image Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {FILTER_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => setFrameData(prev => ({ ...prev, filterPreset: preset.value }))}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            frameData.filterPreset === preset.value
                              ? 'border-black bg-gray-100'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{preset.label}</div>
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Filter
                    </Button>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <Button
                  onClick={saveToAlbums}
                  disabled={isSaving}
                  size="lg"
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save to Albums'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <Footer />
    </div>
  )
}
