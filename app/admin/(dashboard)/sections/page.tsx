import { SectionsManager } from '@/components/admin/sections-manager'

export default function SectionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">Custom Sections</h1>
        <p className="text-muted-foreground mt-2">
          Create dynamic content sections with a Google Forms-like interface
        </p>
      </div>
      
      <SectionsManager />
    </div>
  )
}
