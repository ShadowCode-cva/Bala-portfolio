'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { MapPin, Mail, Phone, Briefcase, Award, Clock } from 'lucide-react'
import type { SiteSettings, Language } from '@/lib/types'

interface AboutSectionProps {
  settings: SiteSettings | null
  languages: Language[]
}

export function AboutSection({ settings, languages }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  }

  const stats = [
    { icon: Briefcase, label: 'Projects', value: '50+' },
    { icon: Award, label: 'Awards', value: '12' },
    { icon: Clock, label: 'Years Exp', value: '7+' },
  ]
  
  return (
    <section id="about" className="py-24 md:py-32 relative overflow-hidden">
      {/* Unified background - synced with home section */}
      <div className="absolute inset-0 bg-background">
        <motion.div
          animate={{ 
            background: [
              'radial-gradient(ellipse 80% 60% at 30% 40%, hsl(var(--primary) / 0.05) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 80% at 70% 60%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 80% 60% at 30% 40%, hsl(var(--primary) / 0.05) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
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
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.p 
              className="text-primary text-sm tracking-[0.3em] uppercase mb-4"
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={isInView ? { opacity: 1, letterSpacing: '0.3em' } : {}}
              transition={{ duration: 0.8 }}
            >
              About Me
            </motion.p>
            <motion.h2 
              className="text-4xl md:text-5xl font-serif font-bold mb-6"
              whileInView={{ scale: [0.95, 1] }}
            >
              Crafting Visual Stories
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              {settings?.bio || 'Passionate creative professional with expertise in video editing and graphic design. I transform ideas into compelling visual stories that captivate audiences and deliver results.'}
            </motion.p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 md:gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
                onHoverStart={() => setHoveredStat(index)}
                onHoverEnd={() => setHoveredStat(null)}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="glass-card rounded-2xl p-6 text-center cursor-default relative overflow-hidden group"
              >
                {/* Animated background glow */}
                <motion.div
                  animate={{ 
                    opacity: hoveredStat === index ? 0.2 : 0,
                    scale: hoveredStat === index ? 1.5 : 1
                  }}
                  className="absolute inset-0 bg-primary rounded-2xl"
                />
                
                <motion.div
                  animate={{ 
                    rotate: hoveredStat === index ? [0, -10, 10, 0] : 0,
                    scale: hoveredStat === index ? 1.2 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                </motion.div>
                
                <motion.p 
                  className="text-3xl md:text-4xl font-bold text-primary mb-1 relative z-10"
                  animate={{ scale: hoveredStat === index ? 1.1 : 1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-sm text-muted-foreground relative z-10">{stat.label}</p>
                
                {/* Shimmer effect */}
                <motion.div
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Info & Languages */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6 group"
            >
              <motion.h3 
                className="text-lg font-semibold mb-4"
                whileHover={{ x: 5, color: 'hsl(var(--primary))' }}
              >
                Contact Information
              </motion.h3>
              <div className="space-y-4">
                {settings?.address && (
                  <motion.div 
                    className="flex items-center gap-4 text-muted-foreground group/item"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="group-hover/item:text-foreground transition-colors">{settings.address}</span>
                  </motion.div>
                )}
                {settings?.email && (
                  <motion.a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-4 text-muted-foreground group/item"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Mail className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="group-hover/item:text-primary transition-colors">{settings.email}</span>
                  </motion.a>
                )}
                {settings?.phone && (
                  <motion.a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-4 text-muted-foreground group/item"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="group-hover/item:text-primary transition-colors">{settings.phone}</span>
                  </motion.a>
                )}
              </div>
            </motion.div>
            
            {/* Languages */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6"
            >
              <motion.h3 
                className="text-lg font-semibold mb-4"
                whileHover={{ x: 5, color: 'hsl(var(--primary))' }}
              >
                Languages
              </motion.h3>
              {languages.length > 0 ? (
                <div className="space-y-4">
                  {languages.map((lang, index) => (
                    <motion.div 
                      key={lang.id} 
                      className="flex items-center justify-between group/lang"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-muted-foreground group-hover/lang:text-foreground transition-colors">
                        {lang.name}
                      </span>
                      <motion.span 
                        className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                        whileHover={{ scale: 1.1, backgroundColor: 'hsl(var(--primary) / 0.2)' }}
                      >
                        {lang.level}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { name: 'Tamil', level: 'Native' },
                    { name: 'English', level: 'Fluent' },
                    { name: 'Hindi', level: 'Conversational' },
                  ].map((lang, index) => (
                    <motion.div 
                      key={lang.name} 
                      className="flex items-center justify-between group/lang"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-muted-foreground group-hover/lang:text-foreground transition-colors">
                        {lang.name}
                      </span>
                      <motion.span 
                        className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                        whileHover={{ scale: 1.1 }}
                      >
                        {lang.level}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
