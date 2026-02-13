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

const DATA_FILE = path.join(process.cwd(), 'data.json')

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
        return JSON.parse(fileContent) as PortfolioData
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
