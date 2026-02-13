'use client'

import React from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import { useRef, useState } from 'react'
import Image from 'next/image'
import type { Skill, Tool } from '@/lib/types'

interface SkillsSectionProps {
  skills: Skill[]
  tools: Tool[]
}

// Tool image mapping
const toolImages: Record<string, string> = {
  'Adobe Premiere Pro': '/images/tools/premiere-pro.png',
  'DaVinci Resolve': '/images/tools/davinci-resolve.png',
  'After Effects': '/images/tools/after-effects.png',
  'Photoshop': '/images/tools/photoshop.png',
  'Illustrator': '/images/tools/illustrator.png',
  'Figma': '/images/tools/figma.png',
  'Blender': '/images/tools/blender.png',
  'Lightroom': '/images/tools/lightroom.png',
}

export function SkillsSection({ skills, tools }: SkillsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)

  const categories = [...new Set(skills.map(s => s.category))]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  return (
    <section id="skills" className="py-24 md:py-32 relative overflow-hidden">
      {/* Unified background - optimized for performance */}
      <div className="absolute inset-0 bg-card/20">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 70% 50% at 30% 50%, hsl(var(--primary) / 0.04) 0%, transparent 60%)',
              'radial-gradient(ellipse 50% 70% at 70% 50%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 50% at 30% 50%, hsl(var(--primary) / 0.04) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
          style={{ willChange: 'auto' }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-primary text-sm tracking-[0.3em] uppercase mb-4"
          >
            Expertise
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif font-bold"
          >
            Skills & Tools
          </motion.h2>
        </motion.div>

        {/* Skills by Category */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-8 mb-20"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="glass-card rounded-2xl p-6 group cursor-default w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] min-w-[300px]"
            >
              <motion.h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
                <motion.span className="w-2 h-2 bg-primary rounded-full" />
                {category}
              </motion.h3>
              <div className="space-y-5">
                {skills
                  .filter(s => s.category === category)
                  .map((skill) => (
                    <motion.div key={skill.id} whileHover={{ x: 5 }} className="group/skill">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm group-hover/skill:text-primary transition-colors">
                          {skill.name}
                        </span>
                        <motion.span className="text-sm text-muted-foreground">
                          {skill.proficiency}%
                        </motion.span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: `${skill.proficiency}%` } : {}}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-primary to-primary/70"
                          style={{ willChange: 'transform' }}
                        />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tools with Real Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h3 className="text-2xl font-serif font-bold text-center mb-12">
            Tools I Master
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {tools.map((tool, index) => {
              const imageSrc = toolImages[tool.name]

              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  onHoverStart={() => setHoveredTool(tool.id)}
                  onHoverEnd={() => setHoveredTool(null)}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="glass-card rounded-xl p-6 text-center group cursor-default relative overflow-hidden w-[calc(50%-1rem)] md:w-[calc(25%-1.5rem)] min-w-[160px]"
                  style={{ willChange: 'transform' }}
                >
                  {/* Tool image or placeholder */}
                  <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center relative bg-black/20 overflow-hidden"
                    animate={{ scale: hoveredTool === tool.id ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {imageSrc ? (
                      <Image
                        src={imageSrc || "/placeholder.svg"}
                        alt={tool.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        priority={index < 4}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {tool.name.charAt(0)}
                      </span>
                    )}
                  </motion.div>

                  <motion.h4 className="font-semibold mb-1 group-hover:text-foreground transition-colors">
                    {tool.name}
                  </motion.h4>
                  <motion.p className="text-xs mb-3 text-muted-foreground">
                    {tool.level}
                  </motion.p>

                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${tool.proficiency}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.4 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ willChange: 'transform' }}
                    />
                  </div>

                  {/* Percentage on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredTool === tool.id ? 1 : 0,
                      y: hoveredTool === tool.id ? 0 : 10,
                    }}
                    className="mt-2 text-xs font-medium text-primary"
                  >
                    {tool.proficiency}% Proficiency
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
