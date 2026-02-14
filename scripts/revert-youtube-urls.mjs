import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toWatchUrl(input) {
    if (!input) return input;

    const idMatch = input.match(/(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
        return `https://www.youtube.com/watch?v=${idMatch[1]}`;
    }
    return input;
}

const dataPath = path.resolve(__dirname, '../data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

let changedCount = 0;

if (data.projects && Array.isArray(data.projects)) {
    data.projects = data.projects.map(project => {
        const oldUrl = project.video_url;
        const newUrl = toWatchUrl(oldUrl);

        if (oldUrl !== newUrl) {
            console.log(`Reverting ${project.title}:`);
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
    console.log(`\nSuccessfully reverted ${changedCount} projects to standard URLs.`);
} else {
    console.log('\nNo changes needed.');
}
