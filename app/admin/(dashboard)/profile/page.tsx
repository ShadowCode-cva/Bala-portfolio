// import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/admin/profile-form'
import { getPortfolioData } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const data = await getPortfolioData()
  const settings = data.settings

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Update your personal information and contact details.
        </p>
      </div>

      <ProfileForm settings={settings} />
    </div>
  )
}
