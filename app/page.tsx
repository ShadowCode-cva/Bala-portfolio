import { getPortfolioData } from '@/lib/storage'
import { PortfolioClient } from '@/components/portfolio/portfolio-client'

// Ensure fresh data on every request
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await getPortfolioData()

  return (
    <PortfolioClient
      settings={data.settings}
      skills={data.skills}
      tools={data.tools}
      projects={data.projects}
      languages={data.languages}
      experience={data.experience}
    />
  )
}
