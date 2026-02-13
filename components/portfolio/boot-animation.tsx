'use client'

import React from "react"
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface BootAnimationProps {
  onComplete: () => void
  onStartTransition: () => void
  heroImageRef?: React.RefObject<HTMLDivElement | null>
}

/**
 * PERFORMANCE NOTES:
 * - Reduced particles from 30 to 8 (boot screen is temporary, doesn't need 30)
 * - Reduced rotating rings from 3 to 1 (visual difference is negligible)
 * - This component unmounts after ~4 seconds, so leaks are limited
 * - Still uses framer-motion here since it's a one-time transition
 */
export function BootAnimation({ onComplete, onStartTransition, heroImageRef }: BootAnimationProps) {
  const [phase, setPhase] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const bootImageRef = useRef<HTMLDivElement>(null)

  const calculateTargetPosition = useCallback(() => {
    if (heroImageRef?.current && bootImageRef.current) {
      const heroRect = heroImageRef.current.getBoundingClientRect()
      setTargetRect({
        x: heroRect.left + heroRect.width / 2,
        y: heroRect.top + heroRect.height / 2,
        width: heroRect.width,
        height: heroRect.height
      })
      return true
    }
    return false
  }, [heroImageRef])

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => onStartTransition(), 2800),
      setTimeout(() => {
        calculateTargetPosition()
        setIsTransitioning(true)
      }, 3200),
      setTimeout(() => onComplete(), 4200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete, onStartTransition, calculateTargetPosition])

  const getTransitionStyles = () => {
    if (!isTransitioning || !targetRect || !bootImageRef.current) return {}
    const bootRect = bootImageRef.current.getBoundingClientRect()
    return {
      x: targetRect.x - (bootRect.left + bootRect.width / 2),
      y: targetRect.y - (bootRect.top + bootRect.height / 2),
      scale: targetRect.width / bootRect.width,
    }
  }

  const transitionStyles = getTransitionStyles()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.8, delay: isTransitioning ? 0.5 : 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
      >
        {/* Grid background — static image, CSS animated position */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 animate-grid-scroll"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
          {/* Scanning line — CSS animation */}
          <div className="absolute left-0 right-0 h-40 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-line" />
        </div>

        {/* Particles — reduced from 30 to 8 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full animate-float-particle"
              style={{
                left: `${10 + i * 12}%`,
                top: `${50 + (i % 4) * 12}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        {/* Profile Image */}
        <motion.div
          ref={bootImageRef}
          initial={{ scale: 0, opacity: 0, rotateY: -180 }}
          animate={isTransitioning ? {
            x: transitionStyles.x || 0,
            y: transitionStyles.y || 0,
            scale: transitionStyles.scale || 1,
            opacity: 0,
            rotateY: 0,
          } : {
            scale: phase >= 1 ? 1 : 0,
            opacity: phase >= 1 ? 1 : 0,
            rotateY: phase >= 1 ? 0 : -180,
          }}
          transition={isTransitioning ? {
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          } : {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative z-10"
          style={{ perspective: 1000 }}
        >
          {/* Pulsing glow — single ring, CSS animated */}
          <div
            className={`absolute -inset-8 rounded-full bg-primary/25 blur-2xl transition-opacity duration-500 ${phase >= 2 && !isTransitioning ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
          />

          {/* Single rotating ring — CSS */}
          <div
            className={`absolute -inset-6 border-2 border-dashed border-primary/30 rounded-full transition-opacity duration-500 ${phase >= 2 && !isTransitioning ? 'opacity-70 animate-spin-slow' : 'opacity-0'}`}
          />

          {/* Profile image */}
          <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden ring-4 ring-primary/60 ring-offset-4 ring-offset-background shadow-2xl shadow-primary/30">
            <Image
              src="/images/profile.jpg"
              alt="Bala Murugan S"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 208px, 256px"
            />
          </div>

          {/* Corner accents — CSS animated */}
          {[
            'absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg',
            'absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg',
            'absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg',
            'absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg',
          ].map((cls, i) => (
            <div
              key={i}
              className={`${cls} transition-opacity duration-500 ${phase >= 2 ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{
            opacity: phase >= 2 && !isTransitioning ? 1 : 0,
            y: phase >= 2 && !isTransitioning ? 0 : 40
          }}
          transition={{ duration: 0.6 }}
          className="mt-10 text-center relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            <span className="text-foreground">Bala</span>{' '}
            <span className="text-primary">Murugan S</span>
          </h1>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: phase >= 2 && !isTransitioning ? 1 : 0,
            y: phase >= 2 && !isTransitioning ? 0 : 30
          }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 w-56 md:w-64 relative z-10"
        >
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: phase >= 2 ? '100%' : '0%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full"
            />
          </div>
          <p
            className={`text-center mt-4 text-xs text-muted-foreground tracking-[0.3em] uppercase transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}
          >
            Initializing Portfolio
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: phase >= 3 && !isTransitioning ? 1 : 0,
            y: phase >= 3 && !isTransitioning ? 0 : 20
          }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-12 text-center"
        >
          <p className="text-sm text-muted-foreground tracking-[0.4em] uppercase">
            Video Editor & Graphic Designer
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
