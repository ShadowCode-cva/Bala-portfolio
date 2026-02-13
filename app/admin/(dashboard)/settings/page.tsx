// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
import { AdminCredentialsManager } from '@/components/admin/credentials-manager'

export default async function AdminCredentialsPage() {
  // Auth is handled by middleware
  const userEmail = process.env.ADMIN_USER || 'admin@example.com'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your admin account credentials and security settings.
        </p>
      </div>

      <AdminCredentialsManager userEmail={userEmail} />
    </div>
  )
}
