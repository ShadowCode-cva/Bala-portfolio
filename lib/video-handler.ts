/**
 * Comprehensive video handling: validation, embedding, aspect ratio detection
 * 
 * KEY IMPROVEMENTS:
 * 1. Extracts src from iframe HTML (e.g., pasted embed code)
 * 2. Handles direct embed URLs (youtube.com/embed/ID)
 * 3. Normalizes YouTube, Vimeo, Google Drive URLs
 * 4. Stores only the clean URL, never raw HTML
 */

export type VideoSource = 'local' | 'youtube' | 'vimeo' | 'gdrive' | 'unknown';

export interface VideoMetadata {
  source: VideoSource;
  embedUrl: string | null;
  canEmbed: boolean;
  aspectRatio: number;
  error: string | null;
}

export function detectVideoSource(url: string | null): VideoSource {
  if (!url) return 'unknown';
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('vimeo.com')) return 'vimeo';
  if (lower.includes('drive.google.com')) return 'gdrive';
  if (lower.startsWith('http') && (lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov'))) return 'local';
  return 'unknown';
}

/**
 * Extract the src attribute from an iframe tag
 * Example: <iframe src="https://youtube.com/embed/xyz"></iframe> → https://youtube.com/embed/xyz
 */
function extractIframeSrc(input: string): string | null {
  const iframeMatch = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }
  return null;
}

/**
 * Normalize a YouTube embed URL that's already in embed format
 * Example: https://www.youtube.com/embed/VIDEO_ID → extracts and validates ID
 */
function normalizeDirectEmbedUrl(url: string): string | null {
  // Check if it's already a YouTube embed URL
  if (url.includes('youtube.com/embed/')) {
    const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Check if it's a Vimeo embed URL
  if (url.includes('player.vimeo.com/video/')) {
    const match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  // Check if it's a Google Drive preview URL
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  return null;
}

export function validateVideoUrl(url: string | null): VideoMetadata {
  if (!url) {
    return {
      source: 'unknown',
      embedUrl: null,
      canEmbed: false,
      aspectRatio: 16 / 9,
      error: 'No URL provided'
    };
  }

  let processedUrl = url.trim();

  // STEP 1: Extract src from iframe HTML if user pasted raw iframe
  const iframeSrc = extractIframeSrc(processedUrl);
  if (iframeSrc) {
    console.log('[VIDEO] Extracted iframe src:', iframeSrc);
    processedUrl = iframeSrc;
  }

  // STEP 2: Try to normalize if it's already an embed URL
  const normalizedEmbed = normalizeDirectEmbedUrl(processedUrl);
  if (normalizedEmbed) {
    console.log('[VIDEO] Using normalized embed URL:', normalizedEmbed);
    return {
      source: detectVideoSource(normalizedEmbed),
      embedUrl: normalizedEmbed,
      canEmbed: true,
      aspectRatio: 16 / 9,
      error: null
    };
  }

  // STEP 3: Detect source and convert URL
  const source = detectVideoSource(processedUrl);
  let embedUrl = null;
  let error = null;

  try {
    switch (source) {
      case 'youtube':
        embedUrl = convertYouTubeUrl(processedUrl);
        break;
      case 'vimeo':
        embedUrl = convertVimeoUrl(processedUrl);
        break;
      case 'gdrive':
        embedUrl = convertGDriveUrl(processedUrl);
        break;
      case 'local':
        embedUrl = processedUrl;
        break;
      default:
        error = 'Unsupported video source. Supports: YouTube, Vimeo, Google Drive, or direct video file URLs.';
    }
  } catch (e) {
    error = `Invalid URL format: ${(e as Error).message}`;
  }

  return {
    source,
    embedUrl,
    canEmbed: !!embedUrl && source !== 'local',
    aspectRatio: 16 / 9,
    error
  };
}

function convertYouTubeUrl(url: string): string {
  try {
    let videoId = null;

    // Handle watch?v= format
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    }
    // Handle youtu.be/ format
    else if (url.includes('youtu.be/')) {
      videoId = url.split('/').pop()?.split('?')[0];
    }
    // Handle youtube.com/shorts/ format
    else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split(/[/?]/)[0];
    }
    // Handle youtube.com/embed/ format (already embed, but maybe with extra params)
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('/embed/')[1]?.split(/[/?]/)[0];
    }

    if (!videoId) throw new Error('Could not extract video ID');

    // Return clean base embed URL
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (e) {
    throw new Error('Invalid YouTube URL');
  }
}

/**
 * Gets a YouTube embed URL with autoplay, mute, and playsinline parameters
 * Optimized for background previews and auto-playing iframes
 */
export function getYouTubeEmbedUrl(url: string, isBackground: boolean = false): string | null {
  try {
    const meta = validateVideoUrl(url);
    if (meta.source !== 'youtube' || !meta.embedUrl) return null;

    const base = meta.embedUrl;
    const params = new URLSearchParams();
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('playsinline', '1');

    if (isBackground) {
      params.set('controls', '0');
      params.set('loop', '1');
      // Extract video ID for loop parameter (YouTube requirement)
      const videoId = base.split('/').pop();
      if (videoId) {
        params.set('playlist', videoId);
      }
    }

    return `${base}?${params.toString()}`;
  } catch (e) {
    return null;
  }
}


function convertVimeoUrl(url: string): string {
  try {
    const parts = url.split('/');
    const videoId = parts[parts.length - 1]?.split('?')[0];
    if (!videoId || isNaN(Number(videoId))) {
      throw new Error('Could not extract video ID');
    }
    return `https://player.vimeo.com/video/${videoId}`;
  } catch (e) {
    throw new Error('Invalid Vimeo URL');
  }
}

function convertGDriveUrl(url: string): string {
  try {
    const videoId = url.split('/d/')[1]?.split('/')[0];
    if (!videoId) throw new Error('Could not extract file ID');
    return `https://drive.google.com/file/d/${videoId}/preview`;
  } catch (e) {
    throw new Error('Invalid Google Drive URL');
  }
}

export async function detectVideoAspectRatio(
  videoElement: HTMLVideoElement | HTMLIFrameElement
): Promise<number> {
  if (videoElement instanceof HTMLVideoElement) {
    return new Promise((resolve) => {
      const checkDimensions = () => {
        const { videoWidth, videoHeight } = videoElement;
        if (videoWidth && videoHeight) {
          videoElement.removeEventListener('loadedmetadata', checkDimensions);
          resolve(videoWidth / videoHeight);
        }
      };
      if (videoElement.videoWidth && videoElement.videoHeight) {
        resolve(videoElement.videoWidth / videoElement.videoHeight);
      } else {
        videoElement.addEventListener('loadedmetadata', checkDimensions);
        setTimeout(() => {
          videoElement.removeEventListener('loadedmetadata', checkDimensions);
          resolve(16 / 9);
        }, 5000);
      }
    });
  }
  return 16 / 9;
}

export function calculateResponsiveHeight(
  width: number,
  aspectRatio: number
): number {
  return Math.round(width / aspectRatio);
}