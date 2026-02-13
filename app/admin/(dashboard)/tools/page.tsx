// import { createClient } from '@/lib/supabase/server'
import { ToolsManager } from '@/components/admin/tools-manager'
import { getPortfolioData } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminToolsPage() {
  const data = await getPortfolioData()
  const tools = data.tools.sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Tools</h1>
        <p className="text-muted-foreground mt-2">
          Manage the software tools you are proficient in.
        </p>
      </div>

      <ToolsManager tools={tools || []} />
    </div>
  )
}
