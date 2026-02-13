'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * PERFORMANCE NOTES:
 * - Removed framer-motion entirely — cursor uses direct DOM manipulation now
 * - Before: Every mouse move → setState → React re-render → framer-motion animate
 *   That's ~60 React re-renders per second just for the cursor!
 * - After: Every mouse move → direct style.transform update (bypasses React completely)
 * - Uses requestAnimationFrame for smooth 60fps without jank
 * - transform: translate() is GPU-composited (no layout/paint cost)
 * - Disabled on mobile/tablet (no hover cursor needed)
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(true) // Default true to avoid flash

  useEffect(() => {
    // Check if device supports hover (desktop)
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setIsMobile(!hasHover)
    if (!hasHover) return

    let mouseX = 0
    let mouseY = 0
    let ringX = 0
    let ringY = 0
    let animationId: number
    let isHovering = false

    // Direct DOM manipulation — no React re-renders
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Smooth follow using lerp (linear interpolation)
    const animate = () => {
      // Ring follows mouse with slight lag (smooth feel)
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15

      if (ringRef.current) {
        const size = isHovering ? 24 : 16
        ringRef.current.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px) scale(${isHovering ? 1.5 : 1})`
        ringRef.current.style.opacity = isHovering ? '1' : '0.6'
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX - 2}px, ${mouseY - 2}px)`
      }

      animationId = requestAnimationFrame(animate)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      isHovering = !!(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.cursor-pointer')
      )
    }

    document.documentElement.style.cursor = 'auto'  // Show native cursor for visibility
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver, { passive: true })
    animationId = requestAnimationFrame(animate)

    return () => {
      document.documentElement.style.cursor = 'auto'
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animationId)
    }
  }, [])

  if (isMobile) return null

  return (
    <>
      {/* Cursor ring — positioned via direct DOM, not React state */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-4 h-4 border-2 border-primary/60 rounded-full pointer-events-none z-50 transition-[width,height,opacity] duration-200"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1 h-1 bg-primary rounded-full pointer-events-none z-50"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      />
    </>
  )
}
