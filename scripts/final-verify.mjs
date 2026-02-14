// Direct logic test for final verification
const YT_VARIANTS = [
    'https://www.youtube.com/watch?v=SVGsNH64L_4',
    'https://youtube.com/watch?v=SVGsNH64L_4',
    'https://www.youtube-nocookie.com/embed/SVGsNH64L_4',
    'https://youtu.be/SVGsNH64L_4',
    'https://www.youtube.com/shorts/SVGsNH64L_4'
];

function convertYouTubeUrl(url) {
    try {
        let videoId = null;
        if (url.includes('/watch')) {
            const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
            if (match) videoId = match[1];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('/').pop().split('?')[0];
        } else if (url.includes('/shorts/')) {
            videoId = url.split('/shorts/')[1].split(/[/?]/)[0];
        } else if (url.includes('/embed/')) {
            videoId = url.split('/embed/')[1].split(/[/?]/)[0];
        }

        if (!videoId) {
            const match = url.match(/(?:v=|youtu\.be\/|embed\/|\/v\/|shorts\/)([a-zA-Z0-9_-]{11})/);
            if (match) videoId = match[1];
        }

        if (!videoId) return 'FAIL';
        return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
        return 'ERROR';
    }
}

console.log('Testing YouTube URL variants:');
YT_VARIANTS.forEach(url => {
    console.log(`${url} -> ${convertYouTubeUrl(url)}`);
});
