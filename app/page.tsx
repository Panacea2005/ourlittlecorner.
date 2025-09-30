"use client"

import { useEffect, useState, useRef, SetStateAction } from "react"
import { motion, AnimatePresence, useAnimationControls, useScroll, useTransform } from "framer-motion"
import LoadingAnimation from "@/components/loading-animation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
 
import Link from "next/link"
import { Button } from "@/components/ui/button"
import TogetherTimer from "@/components/together-timer"

// Home slider cards for nav destinations
const sections = [
  {
    id: 'albums',
    title: 'Albums',
    description: 'Our memories captured together.',
    href: '/albums',
    imageUrl: '/images/sakura.jpg',
    accentColor: 'rgba(255, 182, 193, 0.35)'
  },
  {
    id: 'journals',
    title: 'Journals',
    description: 'Thoughts, letters, and little stories.',
    href: '/journals',
    imageUrl: '/images/tulip.png',
    accentColor: 'rgba(255, 160, 180, 0.35)'
  },
  {
    id: 'special-days',
    title: 'Special Days',
    description: 'Anniversaries, birthdays, and milestones.',
    href: '/special-days',
    imageUrl: '/images/lavender.jpg',
    accentColor: 'rgba(255, 145, 175, 0.35)'
  },
  {
    id: 'memory-timeline',
    title: 'Timeline',
    description: 'All our memories in chronological order.',
    href: '/memory-timeline',
    imageUrl: '/images/bouquet.jpg',
    accentColor: 'rgba(255, 130, 170, 0.35)'
  }
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [wheelTimeout, setWheelTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isCardChanging, setIsCardChanging] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [dailySong, setDailySong] = useState<any>(null)
  const [isLoadingSong, setIsLoadingSong] = useState(true)
  const [loveQuote, setLoveQuote] = useState<string>('')
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const spotifyRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)
  
  // Animation controls for smooth transitions
  const sphereControls = useAnimationControls()
  const expandedCardRef = useRef(null)
  
  // Scroll progress for parallax effects - initialize after mount
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const { scrollYProgress } = useScroll(
    isMounted && containerRef.current 
      ? { container: containerRef }
      : {}
  )
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -50])
  const quoteY = useTransform(scrollYProgress, [0.25, 0.5], [50, -50])
  const pagesY = useTransform(scrollYProgress, [0.5, 0.75], [50, -50])
  
  // Set up smooth loading transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  // Fetch daily love song
  useEffect(() => {
    const fetchDailySong = async () => {
      try {
        setIsLoadingSong(true)
        const response = await fetch('/api/spotify/daily-love-song')
        if (response.ok) {
          const data = await response.json()
          setDailySong(data.song)
        }
      } catch (error) {
        console.error('Failed to fetch daily song:', error)
      } finally {
        setIsLoadingSong(false)
      }
    }

    fetchDailySong()
  }, [])

  // Fetch love quote when song changes
  useEffect(() => {
    if (dailySong) {
      fetchLoveQuote()
    }
  }, [dailySong])

  // Fetch love quotes
  const fetchLoveQuote = async () => {
    try {
      setIsLoadingQuote(true)
      
      // Curated collection of beautiful love quotes
      const loveQuotes = [
        "Love is not about how much you say 'I love you', but how much you prove that it's true.",
        "The best thing to hold onto in life is each other.",
        "In all the world, there is no heart for me like yours.",
        "Love is composed of a single soul inhabiting two bodies.",
        "The greatest thing you'll ever learn is just to love and be loved in return.",
        "I have found the one whom my soul loves.",
        "You are my today and all of my tomorrows.",
        "I love you not only for what you are, but for what I am when I am with you.",
        "The best love is the kind that awakens the soul and makes us reach for more.",
        "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
        "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
        "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
        "Love is when the other person's happiness is more important than your own.",
        "A successful marriage requires falling in love many times, always with the same person.",
        "The real lover is the man who can thrill you by kissing your forehead or smiling into your eyes or just staring into space.",
        "Love is friendship that has caught fire.",
        "The best love is the kind that awakens the soul and makes us reach for more, that plants a fire in our hearts.",
        "I love you more than yesterday, less than tomorrow.",
        "Love is not finding someone to live with. It's finding someone you can't live without.",
        "The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.",
        "In your smile I see something more beautiful than the stars.",
        "Every love story is beautiful, but ours is my favorite.",
        "Love is the master key that opens the gates of happiness.",
        "The best thing to hold onto in life is each other.",
        "Love is like the wind, you can't see it but you can feel it.",
        "A life without love is like a year without summer.",
        "Love is the only force capable of transforming an enemy into a friend.",
        "The heart has its reasons which reason knows nothing of.",
        "Love is the flower you've got to let grow.",
        "True love stories never have endings."
      ]
      
      // Simulate a brief loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 600))
      
      // Randomly select a quote
      const randomIndex = Math.floor(Math.random() * loveQuotes.length)
      setLoveQuote(loveQuotes[randomIndex])
      
    } catch (error) {
      console.error('Failed to fetch love quote:', error)
      setLoveQuote("Love is the greatest adventure of all.")
    } finally {
      setIsLoadingQuote(false)
    }
  }


  // Smooth scroll to section
  const scrollToSection = (sectionIndex: number) => {
    const container = containerRef.current
    if (!container) return

    const targetScrollTop = sectionIndex * window.innerHeight
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
    
    setCurrentSection(sectionIndex)
  }

  // Handle scroll events to update current section (for progress tracking only)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const sectionHeight = window.innerHeight
      const newSection = Math.round(scrollTop / sectionHeight)
      
      if (newSection !== currentSection) {
        setCurrentSection(newSection)
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentSection])
  
  // Handle key events for accessibility
  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (expandedCard) {
        // Handle expanded card view navigation
        if (e.key === 'Escape') {
          handleCardClose()
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          // Find current section index
          const currentIndex = sections.findIndex(s => s.id === expandedCard)
          if (currentIndex < sections.length - 1) {
            setExpandedCard(sections[currentIndex + 1].id)
          }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          // Find current section index
          const currentIndex = sections.findIndex(s => s.id === expandedCard)
          if (currentIndex > 0) {
            setExpandedCard(sections[currentIndex - 1].id)
          }
        }
      } else {
        // Handle main view navigation
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          const newSection = Math.min(4, currentSection + 1)
          if (newSection !== currentSection) {
            scrollToSection(newSection)
          }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          const newSection = Math.max(0, currentSection - 1)
          if (newSection !== currentSection) {
            scrollToSection(newSection)
          }
        } else if (e.key === 'Enter' && currentSection === 2) {
          // Only allow enter on pages section
          handleCardExpand(sections[activeSection].id)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeSection, expandedCard, currentSection])
  
  const handleCardExpand = (sectionId: SetStateAction<string | null>) => {
    setExpandedCard(sectionId)
  }
  
  const handleCardClose = () => {
    setExpandedCard(null)
  }

  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <main className="min-h-dvh flex flex-col bg-white relative overflow-x-hidden">
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 -z-10" />
      
      {/* Navbar component - fixed */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar currentPage="home" />
      </div>

      {/* Scroll container */}
      <div 
        ref={containerRef}
        className="h-dvh overflow-y-auto overflow-x-hidden touch-pan-y overscroll-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Section 1: Hero with Timer */}
        <motion.section 
          ref={heroRef}
          className="min-h-dvh flex items-center justify-center relative"
        >
          <div className="relative w-full h-full grid grid-cols-1 lg:grid-cols-4">
            {/* Left: Hero image */}
            <motion.div 
              className="relative w-full h-full order-2 lg:order-1 lg:col-span-3"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <img 
                src="/images/hero.jpg" 
                alt="hero" 
                className="w-full h-full object-cover object-right" 
              />
            </motion.div>

            {/* Right: Timer */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center p-6 sm:p-10 lg:justify-end lg:pr-12 lg:col-span-1">
              <TogetherTimer fontSizeClamp={'clamp(20px, 4vw, 48px)'} />
            </div>
          </div>
          
          {/* Floating particles animation */}
          <motion.div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${30 + (i % 3) * 20}%`
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 4 + (i * 0.5),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
              />
            ))}
          </motion.div>
          
          {/* Elegant scroll indicator */}
          <motion.div 
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/80"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: [0.4, 0, 0.6, 1]
              }}
              className="flex flex-col items-center"
            >
              <motion.span 
                className="text-sm mb-3 tracking-wide font-light"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                Explore our story
              </motion.span>
              <motion.div
                className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent relative"
                initial={{ height: 0 }}
                animate={{ height: 48 }}
                transition={{ delay: 3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  animate={{ y: [-12, 0, -12] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: [0.4, 0, 0.6, 1],
                    delay: 4
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Section 2: Quote */}
        <motion.section 
          ref={quoteRef}
          className="min-h-dvh flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        >
          <motion.div 
            className="w-full flex justify-center relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Elegant background elements */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-pink-100/30 rounded-full blur-3xl"
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ scale: 1, rotate: 180 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 w-60 h-60 bg-pink-200/20 rounded-full blur-3xl"
              initial={{ scale: 0, rotate: 0 }}
              whileInView={{ scale: 1, rotate: -90 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            />
            
            <motion.div 
              className="font-handwriting text-center text-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-tight max-w-[1200px] relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.3, margin: "-50px" }}
              transition={{ 
                duration: 1.5, 
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.3
              }}
            >
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                In our little corner,
              </motion.span>
              <motion.span 
                className="block relative"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              >
                love grows like{" "}
                <motion.span 
                  className="text-pink-500 underline relative inline-block"
                  initial={{ scale: 1 }}
                  whileInView={{ scale: [1, 1.05, 1] }}
                  viewport={{ once: false, amount: 0.8 }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 1.5 }}
                >
                  sakura
                  <motion.div
                    className="absolute -top-8 -right-8 w-6 h-6"
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    whileInView={{ opacity: [0, 1, 0], scale: [0, 1, 1.2], rotate: 360 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 2 }}
                  >
                    🌸
                  </motion.div>
                </motion.span>
              </motion.span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              >
                in spring.
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Section 3: Pages Section */}
        <motion.section 
          ref={pagesRef}
          className="min-h-dvh flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        >
          <motion.div 
            className="w-full max-w-5xl relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Background decorations removed for minimal look */}

            {sections.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -80, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.3, margin: "-50px" }}
                transition={{ 
                  duration: 1.2, 
                  delay: idx * 0.2, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
              >
                <motion.div 
                  className="flex items-start gap-4 sm:gap-6 group cursor-pointer relative overflow-hidden rounded-2xl p-6 -m-6"
                  onClick={() => handleCardExpand(item.id)}
                  whileHover={{ borderRadius: "1.5rem" }}
                  initial={{ borderRadius: "1rem" }}
                >
                  {/* Removed pink sweep overlay */}
                  
                  <motion.img 
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain select-none relative z-10"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -2, 2, 0],
                      transition: { 
                        scale: { duration: 0.3 },
                        rotate: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                      },
                      filter: 'saturate(1.1)'
                    }}
                    initial={{ filter: 'saturate(0.8)' }}
                  />
                  <div className="flex-1 relative z-10">
                    <motion.h3 
                      className="font-handwriting text-2xl sm:text-3xl md:text-4xl text-gray-800 transition duration-300 relative"
                      whileHover={{ x: 10 }}
                    >
                      <span className="relative inline-block">
                        {item.title}
                        <span className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] bg-gray-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
                      </span>
                    </motion.h3>
                    <motion.p 
                      className="text-sm sm:text-base text-gray-600 mt-1 max-w-prose"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {item.description}
                    </motion.p>
                  </div>
                </motion.div>
                {idx < sections.length - 1 && (
                  <motion.div 
                    className="relative my-8"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ 
                      duration: 1, 
                      delay: (idx * 0.2) + 0.6, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent w-full origin-center" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

       {/* Section 4: Daily Love Song - Minimal & Clean */}
       <motion.section 
          ref={spotifyRef}
          className="min-h-dvh flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        >
          {/* Clean white background with subtle elements */}
          <motion.div 
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Minimal floating elements - matching other sections */}
            <motion.div
              className="absolute top-20 right-20 w-32 h-32 bg-pink-100/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-32 left-32 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl"
              animate={{
                scale: [1.1, 0.9, 1.1],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>

          <motion.div 
            className="w-full max-w-4xl relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.2, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Simple section title - matching other sections */}
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="font-handwriting text-3xl sm:text-4xl md:text-5xl text-gray-800 mb-4">
                Today's Love Song
              </h2>
            </motion.div>

            {/* Clean, minimal song card */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              {isLoadingSong ? (
                <div className="flex items-center justify-center py-16">
                  <motion.div
                    className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="ml-3 text-gray-600">Loading today's song...</span>
                </div>
               ) : dailySong ? (
                 <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                   {/* Left side - Song information */}
                   <motion.div 
                     className="flex-1 space-y-6"
                     initial={{ opacity: 0, x: -30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: false, amount: 0.3 }}
                     transition={{ duration: 0.8, delay: 0.4 }}
                   >
                     {/* Album artwork */}
                     <motion.div 
                       className="flex justify-center lg:justify-start"
                       whileHover={{ scale: 1.02 }}
                       transition={{ duration: 0.3 }}
                     >
                       <img 
                         src={dailySong.image} 
                         alt={dailySong.album_name}
                         className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                       />
                     </motion.div>
                     
                     {/* Song information */}
                     <div className="text-center lg:text-left space-y-4">
                       {/* Song title */}
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: false, amount: 0.5 }}
                         transition={{ duration: 0.8, delay: 0.6 }}
                       >
                         <h3 className="font-handwriting text-3xl lg:text-4xl text-gray-800 mb-3">
                           {dailySong.name}
                         </h3>
                         <motion.div
                           className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full max-w-md mx-auto lg:mx-0"
                           initial={{ scaleX: 0 }}
                           whileInView={{ scaleX: 1 }}
                           viewport={{ once: false, amount: 0.8 }}
                           transition={{ duration: 1, delay: 1 }}
                         />
                       </motion.div>
                       
                       {/* Artist name */}
                       <motion.p 
                         className="text-gray-600 text-xl"
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: false, amount: 0.5 }}
                         transition={{ duration: 0.8, delay: 0.8 }}
                       >
                         by {dailySong.artists}
                       </motion.p>

                       {/* Album name */}
                       <motion.p 
                         className="text-gray-500 text-lg italic"
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: false, amount: 0.5 }}
                         transition={{ duration: 0.8, delay: 1 }}
                       >
                         from "{dailySong.album_name}"
                       </motion.p>

                       {/* Play button */}
                       <motion.div
                         className="pt-6 flex justify-center"
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: false, amount: 0.5 }}
                         transition={{ duration: 0.8, delay: 1.2 }}
                       >
                         <motion.a
                           href={dailySong.external_url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 px-6 py-3 border border-gray-900 text-gray-900 rounded-full hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.98 }}
                         >
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                             <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                           </svg>
                           Play on Spotify
                         </motion.a>
                       </motion.div>
                     </div>
                   </motion.div>

                   {/* Right side - Lyrics */}
                   <motion.div 
                     className="flex-1 space-y-4"
                     initial={{ opacity: 0, x: 30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: false, amount: 0.3 }}
                     transition={{ duration: 0.8, delay: 0.6 }}
                   >
                     
                     <motion.div 
                      className="h-full flex items-center justify-center"
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: false, amount: 0.5 }}
                       transition={{ duration: 0.8, delay: 1 }}
                     >
                       {isLoadingQuote ? (
                         <div className="flex items-center justify-center py-4">
                           <motion.div
                             className="w-6 h-6 border-2 border-gray-300 border-t-pink-500 rounded-full"
                             animate={{ rotate: 360 }}
                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                           />
                           <span className="ml-3 text-gray-600 font-handwriting">Loading love quote...</span>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center text-center pt-8 sm:pt-12 lg:pt-16 px-4 sm:px-6 lg:pl-8 lg:px-0">
                           <motion.div
                             className="max-w-2xl mx-auto"
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ duration: 0.8 }}
                           >
                             <p className="text-gray-700 font-handwriting text-4xl leading-relaxed mb-6">
                               "{loveQuote}"
                             </p>
                           </motion.div>
                         </div>
                       )}
                     </motion.div>
                   </motion.div>
                 </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-4 text-gray-400">♪</div>
                  <p className="text-gray-600">Unable to load today's song</p>
                  <p className="text-gray-500 text-sm mt-2">Please try again later</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Section 5: Footer */}
        <section 
          ref={footerRef}
          className="w-full"
        >
          <div className="w-full">
            <Footer />
          </div>
        </section>
      </div>

      {/* Enhanced expanded card view - fully responsive */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              ref={expandedCardRef}
              className="relative w-full h-full sm:w-[80vw] sm:h-[85vh] lg:w-[80vw] lg:h-[85vh] bg-cover bg-center rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{ 
                backgroundImage: `url(${sections.find(s => s.id === expandedCard)?.imageUrl || '/images/default.jpg'})` 
              }}
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ 
                type: "spring", 
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
            >
              {/* Subtle gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
              
              {/* Close button - responsive positioning */}
              <motion.div 
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.button 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCardClose}
                >
                  <span className="text-white text-lg sm:text-xl">×</span>
                </motion.button>
              </motion.div>
              
              {/* Animated card - responsive content */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-full px-4 sm:px-8 lg:w-3/4 max-w-xl">
                <motion.div 
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 lg:p-8 overflow-hidden"
                  style={{
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* Subtle accent color line at top of card */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t"
                    style={{ 
                      background: sections.find(s => s.id === expandedCard)?.accentColor || 'rgba(147, 112, 219, 0.7)'
                    }}
                  />
                  
                  <div className="text-xs text-white/80 uppercase mb-1 tracking-wider">Portal</div>
                  
                  {/* Responsive title typography */}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-3 sm:mb-4 tracking-tight">
                    {sections.find(s => s.id === expandedCard)?.title}
                  </h2>
                  
                  <div className="text-xs sm:text-sm text-white/90 mb-4 sm:mb-6 tracking-wide"></div>
                  
                  <p className="text-white/85 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8 font-light">
                    {sections.find(s => s.id === expandedCard)?.description}
                  </p>
                  
                  <div className="flex items-center mt-2">
                    <Link href={sections.find(s => s.id === expandedCard)?.href || '#'}>
                      <Button variant="outline" size="sm" className="text-xs">Open</Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              {/* Position indicator - responsive */}
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {sections.map((section, index) => (
                  <motion.div 
                    key={index}
                    className={`rounded-full cursor-pointer ${
                      section.id === expandedCard 
                        ? "bg-white w-4 sm:w-6 h-1.5" 
                        : "bg-white/40 w-1.5 h-1.5"
                    }`}
                    animate={{
                      width: section.id === expandedCard ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 16 : 24) : 6,
                    }}
                    whileHover={{ 
                      backgroundColor: section.id === expandedCard 
                        ? "rgba(255, 255, 255, 1)" 
                        : "rgba(255, 255, 255, 0.6)" 
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedCard(section.id)
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  />
                ))}
              </div>
              
              {/* Navigation buttons - responsive and safe positioning */}
              <div className="absolute bottom-12 sm:bottom-20 left-0 right-0 flex justify-between px-4 sm:px-8 lg:px-12 text-white/50 text-sm">
                {expandedCard !== sections[0].id && (
                  <motion.div 
                    className="flex items-center cursor-pointer group px-2 sm:px-4 py-2 rounded-full"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      transition: { duration: 0.2 }
                    }}
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === expandedCard)
                      if (currentIndex > 0) {
                        setExpandedCard(sections[currentIndex - 1].id)
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 sm:mr-2 transform group-hover:-translate-x-1 transition-transform duration-300">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-light group-hover:text-white transition-colors duration-300">Previous</span>
                  </motion.div>
                )}
                
                {expandedCard !== sections[sections.length-1].id && (
                  <motion.div 
                    className="flex items-center ml-auto cursor-pointer group px-2 sm:px-4 py-2 rounded-full"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    whileHover={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      transition: { duration: 0.2 }
                    }}
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === expandedCard)
                      if (currentIndex < sections.length - 1) {
                        setExpandedCard(sections[currentIndex + 1].id)
                      }
                    }}
                  >
                    <span className="text-xs sm:text-sm font-light group-hover:text-white transition-colors duration-300">Next</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}