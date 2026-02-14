import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import clean logic directly to avoid dependency issues during migration
function extractCleanUrl(input) {
    if (!input) return input;

    // Extract from iframe
    const iframeMatch = input.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    let url = iframeMatch ? iframeMatch[1] : input.trim();

    // YouTube Extraction
    let videoId = null;
    if (url.includes('youtube.com/watch')) {
        const searchParams = new URL(url).searchParams;
        videoId = searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('/').pop().split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('/shorts/')[1].split(/[/?]/)[0];
    } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('/embed/')[1].split(/[/?]/)[0];
    }

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
}

const dataPath = path.resolve(__dirname, '../data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

let changedCount = 0;

if (data.projects && Array.isArray(data.projects)) {
    data.projects = data.projects.map(project => {
        const oldUrl = project.video_url;
        const newUrl = extractCleanUrl(oldUrl);

        if (oldUrl !== newUrl) {
            console.log(`Cleaning ${project.title}:`);
            console.log(`  OLD: ${oldUrl}`);
            console.log(`  NEW: ${newUrl}`);
            changedCount++;
            return { ...project, video_url: newUrl };
        }
        return project;
    });
}

if (changedCount > 0) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log(`\nSuccessfully cleaned ${changedCount} projects.`);
} else {
    console.log('\nNo changes needed.');
}
