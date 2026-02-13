'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { BootAnimation } from './boot-animation'
import { Navigation } from './navigation'
import { HeroSection } from './hero-section'
// Eager load Hero, lazy load the rest
const AboutSection = dynamic(() => import('./about-section').then(mod => mod.AboutSection), { ssr: true })
const SkillsSection = dynamic(() => import('./skills-section').then(mod => mod.SkillsSection), { ssr: true })
const ProjectsSection = dynamic(() => import('./projects-section').then(mod => mod.ProjectsSection), { ssr: true })
const ExperienceSection = dynamic(() => import('./experience-section').then(mod => mod.ExperienceSection), { ssr: true })
const ContactSection = dynamic(() => import('./contact-section').then(mod => mod.ContactSection), { ssr: true })
import { Footer } from './footer'
// import { BackgroundName } from './background-name' // Removed
import { UnifiedBackground } from './unified-background'
import { CustomCursor } from './custom-cursor'
import type { SiteSettings, Skill, Tool, Project, Language, WorkExperience } from '@/lib/types'

interface PortfolioClientProps {
  settings: SiteSettings | null
  skills: Skill[]
  tools: Tool[]
  projects: Project[]
  languages: Language[]
  experience: WorkExperience[]
}

export function PortfolioClient({
  settings,
  skills,
  tools,
  projects,
  languages,
  experience
}: PortfolioClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const heroImageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user has seen the boot animation in this session
    const hasSeenAnimation = sessionStorage.getItem('hasSeenBootAnimation')
    if (hasSeenAnimation) {
      setIsLoading(false)
      setShowContent(true)
      setAnimationComplete(true)
      setContentVisible(true)
    }
  }, [])

  const handleStartTransition = () => {
    // Make the content visible but keep opacity at 0 initially
    setShowContent(true)
    // Small delay to ensure content is rendered before calculating positions
    setTimeout(() => {
      setContentVisible(true)
    }, 100)
  }

  const handleAnimationComplete = () => {
    sessionStorage.setItem('hasSeenBootAnimation', 'true')
    setIsLoading(false)
    // Trigger the hero animation
    setTimeout(() => setAnimationComplete(true), 50)
  }

  return (
    <>
      <CustomCursor />
      <AnimatePresence mode="wait">
        {isLoading && (
          <BootAnimation
            onComplete={handleAnimationComplete}
            onStartTransition={handleStartTransition}
            heroImageRef={heroImageRef}
          />
        )}
      </AnimatePresence>

      {showContent && (
        <div
          className="min-h-screen relative"
          style={{
            opacity: contentVisible ? 1 : 0,
            visibility: showContent ? 'visible' : 'hidden',
            transition: 'opacity 0.5s ease-out'
          }}
        >
          {/* Unified background canvas for seamless sections */}
          <UnifiedBackground />

          {/* Global background name animation REMOVED for performance */}
          {/* <BackgroundName name={settings?.name || 'Bala Murugan S'} /> */}

          <Navigation />
          <main>
            <HeroSection
              settings={settings}
              animationComplete={animationComplete}
              imageRef={heroImageRef}
            />
            <AboutSection settings={settings} languages={languages} />
            <SkillsSection skills={skills} tools={tools} />
            <ProjectsSection projects={projects} />
            <ExperienceSection experience={experience} />
            <ContactSection settings={settings} />
          </main>
          <Footer settings={settings} />
        </div>
      )}
    </>
  )
}
