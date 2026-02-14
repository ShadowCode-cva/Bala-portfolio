import { getPortfolioData } from '@/lib/storage'
import { PortfolioClient } from '@/components/portfolio/portfolio-client'

// Ensure fresh data on every request
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await getPortfolioData()

  // 🛡 SAFETY NET
  const safeData = data ?? {
    settings: {},
    skills: [],
    tools: [],
    projects: [],
    languages: [],
    experience: [],
  }

  return (
    <PortfolioClient
      settings={safeData.settings}
      skills={safeData.skills}
      tools={safeData.tools}
      projects={safeData.projects}
      languages={safeData.languages}
      experience={safeData.experience}
    />
  )
}
