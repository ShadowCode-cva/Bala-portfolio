'use client'

/**
 * PERFORMANCE NOTES:
 * - Replaced 3 framer-motion animated blobs with pure CSS animations
 * - CSS animations run on the GPU compositor thread, not JS main thread
 * - Reduced blur radius from 100px to 80px (saves GPU fill rate)
 * - Noise texture and grid are static — zero CPU cost after first paint
 * - No React re-renders triggered by this component after mount
 */
export function UnifiedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-background" />

      {/* Primary blob — CSS animation, GPU-composited */}
      <div
        className="absolute top-0 left-0 w-[60vw] h-[60vh] bg-primary/[0.03] rounded-full blur-[80px] animate-drift-1"
        style={{ willChange: 'transform' }}
      />

      {/* Secondary blob — CSS animation */}
      <div
        className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-primary/[0.03] rounded-full blur-[80px] animate-drift-2"
        style={{ willChange: 'transform' }}
      />

      {/* Static noise texture — zero runtime cost */}
      <div
        className="absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Static grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 100%)',
          opacity: 0.3,
        }}
      />
    </div>
  )
}
