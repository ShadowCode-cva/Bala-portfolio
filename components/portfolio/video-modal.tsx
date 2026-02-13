'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { X, Film, ExternalLink, AlertCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { validateVideoUrl } from '@/lib/video-handler'
import { motion, AnimatePresence } from 'framer-motion'
import type { Project } from '@/lib/types'

interface VideoModalProps {
    project: Project | null
    isOpen: boolean
    onClose: () => void
}

/**
 * Inner component that handles video rendering
 * Only rendered when project is guaranteed to be non-null
 */
function VideoModalContent({ project, isOpen, onClose }: { project: Project; isOpen: boolean; onClose: () => void }) {
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (isOpen && project) {
            setVideoLoaded(false)
            setIsLoading(false)
            setError(false)
            
            const timer = setTimeout(() => {
                setIsLoading(true)
            }, 300)
            
            return () => clearTimeout(timer)
        }
    }, [isOpen, project?.id])

    // All hooks must be called in the same order every render
    const videoMetadata = useMemo(() => {
        if (!project?.video_url) {
            return {
                source: 'unknown' as const,
                embedUrl: null,
                canEmbed: false,
                aspectRatio: 16 / 9,
                error: 'No video URL available'
            }
        }
        return validateVideoUrl(project.video_url)
    }, [project?.video_url])

    const handleVideoLoad = () => {
        console.log('[VIDEO MODAL] Video loaded successfully')
        setIsLoading(false)
        setVideoLoaded(true)
    }

    const handleVideoError = () => {
        console.log('[VIDEO MODAL] Video failed to load')
        setError(true)
        setIsLoading(false)
    }

    // Timeout for stuck loading states (e.g., slow network)
    useEffect(() => {
        if (isLoading && isOpen && project) {
            const timeoutId = setTimeout(() => {
                console.warn('[VIDEO MODAL] Video loading timeout after 10s')
                setIsLoading(false)
                setError(true)
            }, 10000)
            return () => clearTimeout(timeoutId)
        }
    }, [isLoading, isOpen, project])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black border-neutral-800 shadow-2xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>{project.title}</DialogTitle>
                    <DialogDescription>{project.description}</DialogDescription>
                </DialogHeader>

                <div className="relative bg-neutral-950 flex items-center justify-center" style={{ aspectRatio: '16 / 9' }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {project.thumbnail_url && !videoLoaded && (
                        <motion.img
                            initial={{ opacity: 1 }}
                            animate={{ opacity: isLoading ? 0.5 : 1 }}
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}

                    <AnimatePresence>
                        {isLoading && !videoLoaded && !error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/50"
                            >
                                <Spinner className="h-8 w-8 text-primary mb-3" />
                                <p className="text-sm text-neutral-400">Loading video...</p>
                                <p className="text-xs text-neutral-500 mt-2">(Timeout in ~10s)</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-neutral-950 p-6 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">Video Unavailable</h3>
                            <p className="text-sm text-neutral-400 mb-6">
                                {videoMetadata.error || 'Could not load this video. It might be private, restricted, or the URL may be invalid.'}
                            </p>
                            {project.link && (
                                <Button
                                    onClick={() => window.open(project.link!, '_blank')}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Project
                                </Button>
                            )}
                            <p className="text-xs text-neutral-500 mt-4">Try refreshing the page or checking the URL</p>
                        </div>
                    )}

                    {/* Video rendering - iframe or video element */}
                    <AnimatePresence mode="wait">
                        {!error && videoMetadata.canEmbed && videoMetadata.embedUrl ? (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: videoLoaded ? 1 : 0.3 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0"
                            >
                                <iframe
                                    src={`${videoMetadata.embedUrl}${videoMetadata.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
                                    title={project.title || 'Video'}
                                    className="w-full h-full border-0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    onLoad={handleVideoLoad}
                                    onError={handleVideoError}
                                />
                            </motion.div>
                        ) : !error && project.video_url ? (
                            <motion.div
                                key="video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: videoLoaded ? 1 : 0.3 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0"
                            >
                                <video
                                    src={project.video_url}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                    onCanPlay={handleVideoLoad}
                                    onError={handleVideoError}
                                />
                            </motion.div>
                        ) : !error ? (
                            <motion.div
                                key="no-video"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950"
                            >
                                <AlertCircle className="h-12 w-12 text-amber-500 mb-3" />
                                <p className="text-neutral-400">No video source available</p>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

                <div className="p-4 bg-neutral-900/50 flex items-center justify-between border-t border-neutral-800">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-white">{project.title}</h3>
                        <p className="text-xs text-neutral-400">{project.category}</p>
                    </div>
                    {project.link && (
                        <Button
                            variant="link"
                            className="text-primary text-xs h-auto p-0"
                            onClick={() => window.open(project.link!, '_blank')}
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

/**
 * Outer component - handles null project gracefully
 * Only renders inner component when project exists (hooks rules satisfied)
 */
export function VideoModal({ project, isOpen, onClose }: VideoModalProps) {
    // Render nothing if no project (Dialog handles this internally with `open={false}`)
    if (!project) {
        return <Dialog open={false} onOpenChange={() => {}} />
    }

    return <VideoModalContent project={project} isOpen={isOpen} onClose={onClose} />
}