/**
 * Utility functions for handling video URLs from various platforms
 */

export type VideoType = 'file' | 'embed';

/**
 * Detects if a URL is likely a direct video file or an embeddable link
 */
export function detectVideoType(url: string | null): VideoType {
    if (!url) return 'file';

    const embedPatterns = [
        'youtube.com',
        'youtu.be',
        'vimeo.com',
        'drive.google.com',
        'facebook.com',
        'instagram.com'
    ];

    return embedPatterns.some(pattern => url.toLowerCase().includes(pattern)) ? 'embed' : 'file';
}

/**
 * Converts common video site URLs into their iframe-embeddable equivalents
 */
export function getEmbedUrl(url: string | null): string {
    if (!url) return '';

    let embedUrl = url;

    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('/').pop()?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtube.com/shorts/')) {
        const videoId = url.split('/shorts/')[1].split('/')[0].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    else if (url.includes('vimeo.com/')) {
        // Handle both vimeo.com/12345 and vimeo.com/channels/name/12345
        const parts = url.split('/');
        const videoId = parts[parts.length - 1].split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
    }
    // Google Drive
    else if (url.includes('drive.google.com/file/d/')) {
        const videoId = url.split('/d/')[1].split('/')[0];
        embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
    }

    return embedUrl;
}

// Re-export new video handler functions
export type { VideoMetadata, VideoSource } from './video-handler'
export {
  detectVideoSource,
  validateVideoUrl,
  detectVideoAspectRatio,
  calculateResponsiveHeight
} from './video-handler'