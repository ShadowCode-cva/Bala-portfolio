// import { createClient } from '@/lib/supabase/server'
// import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth handled by middleware
  const user = {
    email: process.env.ADMIN_USER || 'admin@example.com',
    id: 'admin'
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar user={user} />
      <main className="flex-1 lg:ml-64">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
