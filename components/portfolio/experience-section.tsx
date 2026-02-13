'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Briefcase, Calendar, ChevronRight } from 'lucide-react'
import type { WorkExperience } from '@/lib/types'

interface ExperienceSectionProps {
  experience: WorkExperience[]
}

export function ExperienceSection({ experience }: ExperienceSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredExp, setHoveredExp] = useState<string | null>(null)
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  
  return (
    <section id="experience" className="py-24 md:py-32 relative overflow-hidden">
      {/* Unified background - synced with other sections */}
      <div className="absolute inset-0 bg-card/20">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(ellipse 70% 60% at 20% 50%, hsl(var(--primary) / 0.05) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 70% at 80% 50%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 60% at 20% 50%, hsl(var(--primary) / 0.05) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        />
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.p 
            className="text-primary text-sm tracking-[0.3em] uppercase mb-4"
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={isInView ? { opacity: 1, letterSpacing: '0.3em' } : {}}
            transition={{ duration: 0.8 }}
          >
            Career
          </motion.p>
          <motion.h2 
            className="text-4xl md:text-5xl font-serif font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Work Experience
          </motion.h2>
        </motion.div>
        
        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Animated timeline line */}
          <motion.div 
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent md:-translate-x-px"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: 'top' }}
          />
          
          {experience.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + index * 0.2, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredExp(exp.id)}
              onMouseLeave={() => setHoveredExp(null)}
              className={`relative mb-12 md:mb-16 ${
                index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto'
              }`}
            >
              {/* Animated Timeline dot */}
              <motion.div 
                className={`absolute top-0 ${
                  index % 2 === 0 
                    ? 'left-0 md:left-auto md:right-0 md:translate-x-1/2' 
                    : 'left-0 md:-translate-x-1/2'
                } z-10`}
                animate={{
                  scale: hoveredExp === exp.id ? 1.3 : 1,
                }}
              >
                <motion.div
                  className={`w-4 h-4 rounded-full border-4 border-primary bg-background ${
                    exp.is_current ? 'animate-pulse' : ''
                  }`}
                />
                {exp.is_current && (
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
              </motion.div>
              
              {/* Content card */}
              <motion.div 
                className={`ml-8 md:ml-0 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="glass-card rounded-xl p-6 transition-all duration-300 relative overflow-hidden"
                  animate={{
                    borderColor: hoveredExp === exp.id ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border))'
                  }}
                >
                  {/* Animated glow on hover */}
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    animate={{ opacity: hoveredExp === exp.id ? 1 : 0 }}
                  />
                  
                  {/* Header */}
                  <div className={`flex items-start gap-4 mb-4 relative z-10 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                      animate={{ 
                        rotate: hoveredExp === exp.id ? [0, -10, 10, 0] : 0,
                        scale: hoveredExp === exp.id ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Briefcase className="w-6 h-6 text-primary" />
                    </motion.div>
                    <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                      <motion.h3 
                        className="text-lg font-semibold"
                        animate={{ color: hoveredExp === exp.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
                      >
                        {exp.role}
                      </motion.h3>
                      <motion.p 
                        className="text-primary flex items-center gap-1"
                        animate={{ x: hoveredExp === exp.id ? (index % 2 === 0 ? -5 : 5) : 0 }}
                      >
                        {index % 2 !== 0 && <ChevronRight className="w-4 h-4" />}
                        {exp.company}
                        {index % 2 === 0 && <ChevronRight className="w-4 h-4 rotate-180" />}
                      </motion.p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {exp.description && (
                    <motion.p 
                      className={`text-muted-foreground mb-4 relative z-10 ${index % 2 === 0 ? 'md:text-right' : ''}`}
                      animate={{ opacity: hoveredExp === exp.id ? 1 : 0.8 }}
                    >
                      {exp.description}
                    </motion.p>
                  )}
                  
                  {/* Date */}
                  <motion.div 
                    className={`flex items-center gap-2 text-sm text-muted-foreground relative z-10 ${
                      index % 2 === 0 ? 'md:justify-end' : ''
                    }`}
                    animate={{ x: hoveredExp === exp.id ? (index % 2 === 0 ? -5 : 5) : 0 }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                    </span>
                  </motion.div>
                  
                  {/* Current badge */}
                  {exp.is_current && (
                    <motion.div 
                      className={`mt-4 relative z-10 ${index % 2 === 0 ? 'md:text-right' : ''}`}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                        Current Position
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
