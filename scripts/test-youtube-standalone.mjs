/**
 * Standalone test script to verify YouTube URL transformation logic
 * (Logic copied from lib/video-handler.ts for verification)
 */

function convertYouTubeUrl(url) {
    try {
        let videoId = null;

        // Handle watch?v= format
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v');
        }
        // Handle youtu.be/ format
        else if (url.includes('youtu.be/')) {
            videoId = url.split('/').pop().split('?')[0];
        }
        // Handle youtube.com/shorts/ format
        else if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('/shorts/')[1].split(/[/?]/)[0];
        }
        // Handle youtube.com/embed/ format
        else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('/embed/')[1].split(/[/?]/)[0];
        }

        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
        return null;
    }
}

function getYouTubeEmbedUrl(url, isBackground = false) {
    const base = convertYouTubeUrl(url);
    if (!base) return null;

    const params = new URLSearchParams();
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('playsinline', '1');

    if (isBackground) {
        params.set('controls', '0');
        params.set('loop', '1');
        const videoId = base.split('/').pop();
        if (videoId) {
            params.set('playlist', videoId);
        }
    }

    return `${base}?${params.toString()}`;
}

const testUrls = [
    'https://www.youtube.com/watch?v=abc123&t=5',
    'https://youtu.be/abc123?t=10',
    'https://www.youtube.com/shorts/abc123?si=xyz',
    'https://www.youtube.com/embed/abc123?autoplay=0',
    'https://www.youtube.com/watch?v=LuWLXUfJxag',
];

console.log('--- YouTube URL Transformation Tests ---\n');

testUrls.forEach((url, index) => {
    console.log(`Test ${index + 1}: ${url}`);
    const embedUrl = getYouTubeEmbedUrl(url, false);
    const backgroundUrl = getYouTubeEmbedUrl(url, true);

    console.log('  Clean Embed:', embedUrl);
    console.log('  Background :', backgroundUrl);
    console.log('');
});
