'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Play, ExternalLink, Film, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoModal } from './video-modal'
import type { Project } from '@/lib/types'

interface ProjectsSectionProps {
  projects: Project[]
}

interface ProjectInteractionProps {
  onHoverChange: (isHovering: boolean) => void
  onWatchClick: (project: Project) => void
}

// Portrait Device Frame Component
const PortraitDeviceFrame = React.memo(({
  project,
  isActive,
  isCentered,
  onClick,
  onHoverChange,
  onWatchClick,
}: {
  project: Project
  isActive: boolean
  isCentered?: boolean
  onClick: () => void
} & {
  onHoverChange: (isHovering: boolean) => void
  onWatchClick: (project: Project) => void
}) => {
  // Defensive: Validate project data
  if (!project?.id || !project?.title) {
    console.warn('Invalid project data:', project)
    return null
  }

  const [isHovering, setIsHovering] = useState(false)

  const handleHover = (hovering: boolean) => {
    setIsHovering(hovering)
    onHoverChange(hovering)
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Guard: Don't show preview if hovering over footer
    const target = e.target as HTMLElement
    if (target.closest('footer')) return
    handleHover(true)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Guard: Don't process if event came from footer
    const target = e.target as HTMLElement
    if (target.closest('footer')) return
    handleHover(false)
  }

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer flex-shrink-0 group/frame"
      style={{
        willChange: isActive ? 'transform' : 'auto',
        animationPlayState: isHovering ? 'paused' : 'running'
      }}
    >
      {/* Device container */}
      <div className="relative">
        {/* Device glow */}
        {isActive && (
          <motion.div
            animate={{
              opacity: isHovering ? 0.6 : 0.2,
            }}
            transition={{ duration: 0.2 }}
            className="absolute -inset-6 bg-gradient-to-br from-primary/40 via-primary/20 to-transparent rounded-3xl blur-3xl"
          />
        )}

        {/* Device body - portrait ratio */}
        <div className="relative bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-2xl md:rounded-3xl p-2 md:p-3 shadow-2xl shadow-black/60 w-[200px] sm:w-[240px] md:w-[280px] lg:w-[340px] group-hover/frame:[animation-play-state:paused]">
          {/* Camera notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-neutral-900 rounded-b-2xl hidden md:block" />

          {/* Screen - portrait 9:16 ratio */}
          <div className="relative aspect-[9/16] bg-black rounded-lg md:rounded-xl overflow-hidden">
            {project.thumbnail_url ? (
              <motion.img
                src={project.thumbnail_url}
                alt={project.title}
                className="object-cover w-full h-full"
                loading="lazy"
                sizes="(max-width: 768px) 240px, (max-width: 1024px) 280px, 340px"
                animate={{
                  scale: isHovering && isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{ willChange: isActive ? 'transform' : 'auto' }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 via-muted to-primary/10 flex items-center justify-center">
                <Film className="w-12 h-12 text-primary/40" />
              </div>
            )}

            {/* Hover overlay */}
            <AnimatePresence>
              {isHovering && isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-between p-3"
                >
                  <div />

                  <div className="flex flex-col items-center gap-2">
                    <motion.h3
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm md:text-base font-serif font-bold text-center"
                    >
                      {project.title}
                    </motion.h3>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                      className="flex items-center gap-1 text-primary text-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      {project.category}
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="flex gap-2 mt-1"
                    >
                      {project?.video_url && (
                        <Button
                          size="sm"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onWatchClick(project)
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Watch
                        </Button>
                      )}
                      {project?.link && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full bg-transparent border-white/30 hover:bg-white/10 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(project.link!, '_blank')
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      )}
                    </motion.div>
                  </div>

                  <div />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Featured badge — CSS pulse instead of framer-motion Infinity */}
            {project.featured && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                <Sparkles className="w-2 h-2" />
                Featured
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
})
PortraitDeviceFrame.displayName = 'PortraitDeviceFrame'

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, margin: '-100px' })

  // Defensive: Filter out invalid projects and log warnings
  const validProjects = projects.filter(p => {
    if (!p?.id || !p?.title) {
      console.warn('Skipping invalid project data:', p)
      return false
    }
    return true
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const [displayMode, setDisplayMode] = useState<'single' | 'double' | 'carousel'>('carousel')
  const [isPaused, setIsPaused] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const isInteracting = useRef(false)

  // Determine display mode based on project count
  useEffect(() => {
    if (validProjects.length === 1) {
      setDisplayMode('single')
      setActiveIndex(0)
    } else if (validProjects.length === 2) {
      setDisplayMode('double')
    } else {
      setDisplayMode('carousel')
    }
  }, [validProjects.length])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + validProjects.length) % validProjects.length)
  }, [validProjects.length])

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % validProjects.length)
  }, [validProjects.length])

  // Auto-advance carousel every 8 seconds
  useEffect(() => {
    if (displayMode === 'carousel' && !isPaused) {
      const timer = setInterval(() => {
        handleNext()
      }, 8000)
      return () => clearInterval(timer)
    }
  }, [displayMode, handleNext, isPaused])

  const handleInteractionChange = useCallback((hovering: boolean) => {
    isInteracting.current = hovering
    setIsPaused(isInteracting.current || !!selectedProject)
  }, [selectedProject])

  const handleWatchClick = useCallback((project: Project) => {
    setSelectedProject(project)
    setIsPaused(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null)
    setIsPaused(isInteracting.current)
  }, [])

  if (validProjects.length === 0) {
    console.warn('No valid projects to display')
    return null
  }

  return (
    <section
      ref={ref}
      id="projects"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Static background — no animation needed for a subtle gradient */}
      <div className="absolute inset-0 bg-background -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.05) 0%, transparent 60%)'
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-balance">
            Featured Work
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore my latest creative projects showcasing video editing, motion graphics, and visual design.
          </p>
        </motion.div>

        {/* Projects display - responsive layout */}
        <div className="flex items-center justify-center">
          {displayMode === 'single' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <PortraitDeviceFrame
                project={validProjects[0]}
                isActive={true}
                isCentered={true}
                onClick={() => { }}
                onHoverChange={handleInteractionChange}
                onWatchClick={handleWatchClick}
              />
            </motion.div>
          )}

          {displayMode === 'double' && (
            <div className="flex gap-8 md:gap-12 justify-center items-center flex-wrap">
              {validProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <PortraitDeviceFrame
                    project={project}
                    isActive={true}
                    onClick={() => { }}
                    onHoverChange={handleInteractionChange}
                    onWatchClick={handleWatchClick}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {displayMode === 'carousel' && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                {/* Left arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  className="flex-shrink-0 p-2 md:p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors z-20"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Carousel container */}
                <div className="flex-1 flex justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                      <PortraitDeviceFrame
                        project={validProjects[activeIndex]}
                        isActive={true}
                        onClick={() => { }}
                        onHoverChange={handleInteractionChange}
                        onWatchClick={handleWatchClick}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right arrow */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="flex-shrink-0 p-2 md:p-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors z-20"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>

              {/* Carousel indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-2 mt-8"
              >
                {validProjects.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    animate={{
                      width: activeIndex === index ? 24 : 8,
                      opacity: activeIndex === index ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.2 }}
                    className="h-2 rounded-full bg-primary"
                  />
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Project count info */}
        {displayMode === 'carousel' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10 text-sm text-muted-foreground"
          >
            {activeIndex + 1} / {projects.length}
          </motion.div>
        )}
        {/* Video Modal */}
        <VideoModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={handleCloseModal}
        />
      </div>
    </section>
  )
}
