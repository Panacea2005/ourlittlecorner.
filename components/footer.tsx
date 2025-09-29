"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function Footer() {
  return (
    <motion.footer 
      className="relative w-full overflow-hidden mt-auto p-0 m-0 leading-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <img 
        src="/images/footer.jpg" 
        alt="footer garden" 
        className="block w-full h-auto select-none"
      />
    </motion.footer>
  )
}