import { validateVideoUrl, getYouTubeEmbedUrl } from '../lib/video-handler.ts';

const testUrls = [
    'https://www.youtube.com/watch?v=abc123&t=5',
    'https://youtu.be/abc123?t=10',
    'https://www.youtube.com/shorts/abc123?si=xyz',
    'https://www.youtube.com/embed/abc123?autoplay=0',
    '<iframe src="https://www.youtube.com/embed/abc123" width="560" height="315"></iframe>',
    'https://www.youtube.com/watch?v=LuWLXUfJxag',
];

console.log('--- YouTube URL Transformation Tests ---\n');

testUrls.forEach((url, index) => {
    console.log(`Test ${index + 1}: ${url}`);
    try {
        const meta = validateVideoUrl(url);
        const embedUrl = getYouTubeEmbedUrl(url, false);
        const backgroundUrl = getYouTubeEmbedUrl(url, true);

        console.log('  Clean Embed:', embedUrl);
        console.log('  Background:', backgroundUrl);
        console.log('');

        if (embedUrl && !embedUrl.includes('autoplay=1')) {
            console.error('  FAILED: Missing autoplay parameter');
        }
        if (backgroundUrl && !backgroundUrl.includes('controls=0')) {
            console.error('  FAILED: Missing background-specific parameters');
        }
    } catch (e) {
        console.error('  ERRORED:', e.message);
    }
});
