'use client'

import React from "react"
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { SiteSettings } from '@/lib/types'

interface HeroSectionProps {
  settings: SiteSettings | null
  animationComplete?: boolean
  imageRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * PERFORMANCE NOTES:
 * - Removed `window.innerWidth` calls (crashes SSR, forces layout recalc)
 * - Reduced particles from 20 to 5 (CSS-animated, no framer-motion per-particle)
 * - Removed duplicate blob set (was 8 extra animated divs)
 * - Replaced animated gradient background with static + CSS transition
 * - useSpring for mouse tilt is kept (GPU-friendly, only runs on hover)
 * - Scroll-linked transforms (y, opacity, scale) are GPU-composited via framer-motion
 */
export function HeroSection({ settings, animationComplete = true, imageRef }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const name = settings?.name || 'Bala Murugan S'
  const title = settings?.title || 'Video Editor & Graphic Designer'

  // Mouse tracking for 3D tilt effect — only active on hover, GPU-friendly
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [isHovering, setIsHovering] = useState(false)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 20 })
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 150, damping: 20 })
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Static background gradient — no animation, pure CSS */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 40% 50%, hsl(var(--primary) / 0.07) 0%, transparent 60%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* 
        PERFORMANCE: Replaced 20 framer-motion particles with 5 CSS-animated dots.
        CSS animations run on the compositor thread (GPU), not the main JS thread.
        This eliminates ~20 React re-render sources per animation frame.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float-particle"
            style={{
              left: `${15 + i * 18}%`,
              top: `${60 + (i % 3) * 15}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Static background blobs — no animation, just blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Content — scroll-linked transforms are GPU-composited */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 container mx-auto px-6"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Profile Image with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{
              opacity: animationComplete ? 1 : 0,
              scale: animationComplete ? 1 : 0.8,
              y: animationComplete ? 0 : 50
            }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            style={{ perspective: 1000 }}
          >
            <motion.div
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d'
              }}
              className="relative group cursor-pointer"
            >
              {/* Glow — CSS transition, not framer-motion */}
              <motion.div
                style={{ x: glowX, y: glowY }}
                className={`absolute -inset-8 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-3xl blur-2xl transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-50'}`}
              />

              {/* Single rotating ring — CSS animation, not framer-motion */}
              <div
                className="absolute -inset-4 border-2 border-dashed border-primary/20 rounded-3xl animate-spin-slow"
                style={{ transform: 'translateZ(-30px)' }}
              />

              {/* Main image */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden glass-card shadow-2xl shadow-primary/20">
                <Image
                  src="/images/profile.jpg"
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 256px, 320px"
                />

                {/* Overlay gradient on hover — CSS only */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent transition-opacity duration-400 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                />

                {/* Hover info card — CSS transition */}
                <div
                  className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-400 ${isHovering ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary tracking-wider uppercase font-medium">Creative Professional</span>
                  </div>
                  <p className="text-xl font-serif font-bold text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{title}</p>
                </div>
              </div>

              {/* Corner accents — static, no animation */}
              {[
                { pos: '-top-1 -left-1', border: 'border-t-2 border-l-2', round: 'rounded-tl-lg' },
                { pos: '-top-1 -right-1', border: 'border-t-2 border-r-2', round: 'rounded-tr-lg' },
                { pos: '-bottom-1 -left-1', border: 'border-b-2 border-l-2', round: 'rounded-bl-lg' },
                { pos: '-bottom-1 -right-1', border: 'border-b-2 border-r-2', round: 'rounded-br-lg' },
              ].map((corner, i) => (
                <div
                  key={i}
                  className={`absolute ${corner.pos} w-5 h-5 ${corner.border} border-primary/70 ${corner.round} transition-transform duration-300 ${isHovering ? 'scale-125' : 'scale-100'}`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <div className="text-center lg:text-left max-w-xl">
            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-6 flex items-center justify-center lg:justify-start gap-2"
            >
              {/* Pulsing dot — CSS animation instead of framer Infinity loop */}
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Welcome to my portfolio
            </motion.p>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6"
            >
              {name.split(' ').map((word, i) => (
                <span
                  key={i}
                  className={`inline-block ${i === 0 ? 'text-foreground' : 'text-primary'} hover:scale-105 transition-transform duration-200`}
                >
                  {word}{i < name.split(' ').length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </motion.h1>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative mb-10"
            >
              <p className="text-xl md:text-2xl text-muted-foreground">
                {title}
              </p>
              {/* Blinking cursor — CSS animation */}
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-primary hidden lg:block animate-blink" />
            </motion.div>

            {/* CTA Buttons — hover via CSS, not framer whileHover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: animationComplete ? 1 : 0, y: animationComplete ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <div className="hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98] transition-transform duration-200">
                <Button
                  size="lg"
                  className="group bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden px-8"
                  onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-125" />
                  View Projects
                </Button>
              </div>
              <div className="hover:scale-105 hover:-translate-y-0.5 active:scale-[0.98] transition-transform duration-200">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10 bg-transparent group relative overflow-hidden px-8"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <span className="relative z-10">Get in Touch</span>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom decorative dot — CSS animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animationComplete ? 1 : 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 shadow-[0_0_10px_currentColor] animate-pulse" />
      </motion.div>
    </section>
  )
}
