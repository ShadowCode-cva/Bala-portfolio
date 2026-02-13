'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion'
import { Menu, X, Home, User, Award, FolderKanban, Briefcase, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'About', href: '#about', icon: User },
  { label: 'Skills', href: '#skills', icon: Award },
  { label: 'Projects', href: '#projects', icon: FolderKanban },
  { label: 'Experience', href: '#experience', icon: Briefcase },
  { label: 'Contact', href: '#contact', icon: Mail },
]

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  
  // Scroll progress for sticky progress bar
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })
  
  // Parallax effect for nav background
  const navOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1])
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
      // Update active section based on scroll position
      const sections = navItems.map(item => item.href.slice(1))
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.getElementById(href.slice(1))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  return (
    <>
      {/* Sticky Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-[60] overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 origin-left"
          style={{ scaleX }}
        />
        {/* Shimmer effect on progress bar */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ scaleX }}
        />
      </motion.div>
      
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-1 left-0 right-0 z-50"
      >
        <motion.div
          className={`mx-4 md:mx-8 rounded-2xl transition-all duration-500 ${
            isScrolled 
              ? 'glass-card py-3 shadow-lg shadow-black/10' 
              : 'py-4'
          }`}
        >
          <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
            {/* Animated Logo */}
            <motion.a
              href="#home"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('#home')
              }}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-2xl font-serif font-bold text-primary relative"
                animate={{ 
                  textShadow: isScrolled 
                    ? '0 0 20px hsl(var(--primary) / 0.5)' 
                    : '0 0 0px transparent'
                }}
              >
                BM
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = activeSection === item.href.slice(1)
                const isHovered = hoveredItem === item.href
                
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(item.href)
                    }}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="relative px-4 py-2 rounded-xl group"
                  >
                    {/* Background highlight */}
                    <AnimatePresence>
                      {(isActive || isHovered) && (
                        <motion.div
                          layoutId="navHighlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`absolute inset-0 rounded-xl ${
                            isActive 
                              ? 'bg-primary/15' 
                              : 'bg-muted/50'
                          }`}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <span className={`relative z-10 flex items-center gap-2 text-sm tracking-wide transition-colors ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}>
                      <motion.span
                        animate={{ 
                          scale: isActive ? 1.1 : 1,
                          rotate: isHovered ? [0, -10, 10, 0] : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.span>
                      {item.label}
                    </span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.a>
                )
              })}
            </div>
            
            {/* Mobile Menu Button */}
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden relative overflow-hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-lg md:hidden"
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-80 z-50 bg-card border-l border-border md:hidden"
            >
              {/* Close button */}
              <div className="flex justify-end p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              
              {/* Nav items */}
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.href.slice(1)
                  
                  return (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(item.href)
                      }}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <motion.div
                        animate={{ 
                          scale: isActive ? 1.2 : 1,
                          rotate: isActive ? 360 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <span className="text-lg font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveIndicator"
                          className="ml-auto w-2 h-2 bg-primary rounded-full"
                        />
                      )}
                    </motion.a>
                  )
                })}
              </div>
              
              {/* Bottom decoration */}
              <div className="absolute bottom-8 left-6 right-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <p className="text-sm text-muted-foreground mb-1">Portfolio of</p>
                  <p className="text-lg font-serif font-bold text-primary">Bala Murugan S</p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
