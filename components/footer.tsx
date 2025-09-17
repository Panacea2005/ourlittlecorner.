"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function Footer() {
  return (
    <motion.footer 
      className="relative w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Full-width footer image */}
      <div className="relative w-full">
        <img 
          src="/images/footer.jpg" 
          alt="footer garden" 
          className="w-full h-auto block select-none"
        />
        {/* Top fade to blend with page background */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-b from-white via-white/70 to-transparent" />
      </div>
    </motion.footer>
  )
}