import { SiteSettings, Skill, Tool, Project, Language, WorkExperience, ContentSection } from './types'
import fs from 'fs'
import path from 'path'

export interface PortfolioData {
    settings: SiteSettings
    skills: Skill[]
    tools: Tool[]
    projects: Project[]
    languages: Language[]
    experience: WorkExperience[]
    sections: ContentSection[]
}

// Use an environment variable for the data path to support persistent storage in containers (e.g., Render Disks)
// Fallback to local 'data.json' if not set
const DATA_FILE = process.env.PORTFOLIO_DATA_PATH || path.join(process.cwd(), 'data.json')

const defaultData: PortfolioData = {
    settings: {
        id: '1',
        profile_image_url: null,
        name: 'Bala Murugan S',
        title: 'Video Editor & Graphic Designer',
        bio: '',
        phone: '',
        email: '',
        address: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    skills: [],
    tools: [],
    projects: [],
    languages: [],
    experience: [],
    sections: []
}

export async function getPortfolioData(): Promise<PortfolioData> {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            console.log('data.json not found, creating with defaults')
            await savePortfolioData(defaultData)
            return defaultData
        }

        const fileContent = fs.readFileSync(DATA_FILE, 'utf8')
        const data = JSON.parse(fileContent) as PortfolioData

        // Data Migration: Ensure all projects have a category (default to Video Editing)
        if (data.projects && Array.isArray(data.projects)) {
            let hasChanges = false
            data.projects = data.projects.map(project => {
                if (!project.category) {
                    hasChanges = true
                    return { ...project, category: 'Video Editing' }
                }
                return project
            })

            // If we fixed any projects, save back to file for persistence
            if (hasChanges) {
                console.log('Migrated project categories to default "Video Editing"')
                savePortfolioData(data)
            }
        }

        return data
    } catch (error) {
        console.error('Error reading data from data.json:', error)
        return defaultData
    }
}

export async function savePortfolioData(data: PortfolioData): Promise<boolean> {
    try {
        // Ensure the directory exists (though it should be root)
        const dir = path.dirname(DATA_FILE)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
        return true
    } catch (error) {
        console.error('Error writing data to data.json:', error)
        return false
    }
}
