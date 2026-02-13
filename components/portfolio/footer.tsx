'use client'

import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteSettings } from '@/lib/types'

interface FooterProps {
  settings: SiteSettings | null
}

export function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const name = settings?.name || 'Bala Murugan S'
  const router = useRouter()
  
  // Secret access states
  const [logoClicks, setLogoClicks] = useState(0)
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [showHint, setShowHint] = useState(false)
  
  // Secret key sequence: "admin" typed anywhere on the page
  const secretSequence = ['a', 'd', 'm', 'i', 'n']
  
  // Handle keyboard secret code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...keySequence, e.key.toLowerCase()].slice(-5)
      setKeySequence(newSequence)
      
      // Check if the sequence matches
      if (newSequence.join('') === secretSequence.join('')) {
        router.push('/admin/login')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keySequence, router])
  
  // Handle logo triple-click
  const handleLogoClick = useCallback(() => {
    const newClicks = logoClicks + 1
    setLogoClicks(newClicks)
    
    // Show subtle hint after first click
    if (newClicks >= 1) {
      setShowHint(true)
      setTimeout(() => setShowHint(false), 2000)
    }
    
    // Navigate to admin on 5 clicks
    if (newClicks >= 5) {
      router.push('/admin/login')
      setLogoClicks(0)
    }
    
    // Reset clicks after 2 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 2000)
  }, [logoClicks, router])
  
  return (
    <footer className="py-12 border-t border-border relative overflow-hidden">
      {/* Animated gradient */}
      <motion.div
        animate={{ 
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Animated name marquee */}
        <div className="overflow-hidden mb-12">
          <motion.div 
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex whitespace-nowrap"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.span
                key={i}
                className="mx-8 text-4xl md:text-6xl font-serif font-bold text-muted/10"
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Animated Logo with secret access */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            className="text-3xl font-serif font-bold text-primary cursor-pointer select-none relative"
          >
            BM
            {/* Subtle hint indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: showHint ? 0.5 : 0, 
                scale: showHint ? 1 : 0 
              }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
            />
            {/* Click progress indicator (very subtle) */}
            {logoClicks > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(logoClicks / 5) * 100}%` }}
                className="absolute -bottom-2 left-0 h-0.5 bg-primary/30 rounded-full"
              />
            )}
          </motion.div>
          
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-muted-foreground text-center"
          >
            {currentYear} {name}. All rights reserved.
          </motion.p>
          
          {/* Animated Back to top button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, color: 'hsl(var(--primary))' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors group"
          >
            <span>Back to Top</span>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUp className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
