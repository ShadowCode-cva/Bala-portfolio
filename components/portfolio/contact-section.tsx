'use client'

import React from "react"
import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Mail, Phone, MapPin, Send, Linkedin, Instagram, Twitter, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SiteSettings } from '@/lib/types'

interface ContactSectionProps {
  settings: SiteSettings | null
}

export function ContactSection({ settings }: ContactSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const socialButtons = [
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Twitter, label: 'Twitter' },
  ]

  return (
    <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
      {/* Unified background - synced with other sections */}
      <div className="absolute inset-0 bg-background">
        <motion.div
          animate={{
            background: [
              'radial-gradient(ellipse 80% 70% at 40% 70%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
              'radial-gradient(ellipse 70% 80% at 60% 30%, hsl(var(--primary) / 0.07) 0%, transparent 60%)',
              'radial-gradient(ellipse 80% 70% at 40% 70%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
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

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + '%',
              y: '100%',
              opacity: 0
            }}
            animate={{
              y: '-100%',
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
          />
        ))}
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
            className="text-primary text-sm tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
          >
            <Sparkles className="w-4 h-4" />
            Get in Touch
            <Sparkles className="w-4 h-4" />
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            {"Let's Work Together"}
          </motion.h2>
          <motion.p
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Have a project in mind? I would love to hear about it. Send me a message and lets create something amazing together.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="h-full"
          >
            <motion.div
              className="glass-card rounded-2xl p-8 h-full flex flex-col"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.h3
                className="text-xl font-serif font-bold mb-6"
                whileHover={{ x: 5, color: 'hsl(var(--primary))' }}
              >
                Contact Information
              </motion.h3>

              <div className="space-y-6">
                {settings?.email && (
                  <motion.a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      <Mail className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{settings.email}</p>
                    </div>
                  </motion.a>
                )}

                {settings?.phone && (
                  <motion.a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors group"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">{settings.phone}</p>
                    </div>
                  </motion.a>
                )}

                {settings?.address && (
                  <motion.div
                    className="flex items-center gap-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      <MapPin className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{settings.address}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Follow Me</p>
                <div className="flex gap-4">
                  {socialButtons.map((social, index) => (
                    <motion.div
                      key={social.label}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full border-border hover:border-primary hover:text-primary hover:bg-primary/10 bg-transparent"
                      >
                        <social.icon className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-full"
          >
            <motion.div
              className="glass-card rounded-2xl p-8 h-full flex flex-col"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Send className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-serif font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. I will get back to you soon.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="mt-6 bg-transparent"
                      onClick={() => setSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <motion.div
                      animate={{ scale: focusedField === 'name' ? 1.02 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="name" className="text-sm text-muted-foreground mb-2 block">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        required
                        className="bg-background/50 transition-all focus:ring-2 focus:ring-primary/20"
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </motion.div>
                    <motion.div
                      animate={{ scale: focusedField === 'email' ? 1.02 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label htmlFor="email" className="text-sm text-muted-foreground mb-2 block">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="bg-background/50 transition-all focus:ring-2 focus:ring-primary/20"
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{ scale: focusedField === 'subject' ? 1.02 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label htmlFor="subject" className="text-sm text-muted-foreground mb-2 block">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Project inquiry"
                      required
                      className="bg-background/50 transition-all focus:ring-2 focus:ring-primary/20"
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </motion.div>

                  <motion.div
                    animate={{ scale: focusedField === 'message' ? 1.02 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex-grow flex flex-col"
                  >
                    <label htmlFor="message" className="text-sm text-muted-foreground mb-2 block">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your project..."
                      rows={5}
                      required
                      className="bg-background/50 resize-none transition-all focus:ring-2 focus:ring-primary/20 flex-grow"
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-2"
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 relative overflow-hidden group"
                      disabled={isSubmitting}
                    >
                      <motion.span
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%', skewX: -15 }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      {isSubmitting ? (
                        <span className="flex items-center gap-2 relative z-10">
                          <motion.span
                            className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 relative z-10">
                          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          Send Message
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
