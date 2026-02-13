export interface SiteSettings {
  id: string
  profile_image_url: string | null
  name: string
  title: string
  bio: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
  icon_url: string | null
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Tool {
  id: string
  name: string
  proficiency: number
  level: string
  icon_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string | null
  category: string
  thumbnail_url: string | null
  video_url: string | null
  video_type?: 'file' | 'embed'
  video_local_path?: string | null
  link: string | null
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}


export interface Language {
  id: string
  name: string
  level: string
  sort_order: number
  created_at: string
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  description: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ContentField {
  id: string
  type: 'text' | 'textarea' | 'image' | 'video' | 'number'
  label: string
  value: string
}

export interface ContentSection {
  id: string
  name: string
  description: string
  fields: ContentField[]
  isExpanded?: boolean
  isVisible: boolean
  sortOrder: number
}
