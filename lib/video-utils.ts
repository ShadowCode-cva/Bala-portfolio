/**
 * Utility functions for handling video URLs from various platforms
 */

export type VideoType = 'file' | 'embed';

import { validateVideoUrl, detectVideoSource } from './video-handler'

/**
 * Detects if a URL is likely a direct video file or an embeddable link
 */
export function detectVideoType(url: string | null): VideoType {
    if (!url) return 'file';
    const source = detectVideoSource(url);
    return source !== 'local' && source !== 'unknown' ? 'embed' : 'file';
}

/**
 * Converts common video site URLs into their iframe-embeddable equivalents
 * Legacy wrapper for validateVideoUrl
 */
export function getEmbedUrl(url: string | null): string {
    const meta = validateVideoUrl(url);
    return meta.embedUrl || url || '';
}

// Re-export current video handler types and functions
export type { VideoMetadata, VideoSource } from './video-handler'
export {
    detectVideoSource,
    validateVideoUrl,
    getYouTubeEmbedUrl,
    detectVideoAspectRatio,
    calculateResponsiveHeight
} from './video-handler'
