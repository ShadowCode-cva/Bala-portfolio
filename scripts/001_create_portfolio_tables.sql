-- Portfolio content tables with RLS

-- Profile/settings table (single row for site owner)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_image_url TEXT,
  name TEXT NOT NULL DEFAULT 'Bala Murugan S',
  title TEXT NOT NULL DEFAULT 'Video Editor & Graphic Designer',
  bio TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  proficiency INTEGER NOT NULL DEFAULT 50,
  icon_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tools proficiency table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  proficiency INTEGER NOT NULL DEFAULT 50,
  level TEXT NOT NULL DEFAULT 'Intermediate',
  icon_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  link TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Languages table
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (portfolio is public)
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Public read work_experience" ON public.work_experience FOR SELECT USING (true);

-- Admin write access (authenticated users can modify)
CREATE POLICY "Admin insert site_settings" ON public.site_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete site_settings" ON public.site_settings FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin insert skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update skills" ON public.skills FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete skills" ON public.skills FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin insert tools" ON public.tools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update tools" ON public.tools FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete tools" ON public.tools FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin insert projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update projects" ON public.projects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin insert languages" ON public.languages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update languages" ON public.languages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete languages" ON public.languages FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin insert work_experience" ON public.work_experience FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admin update work_experience" ON public.work_experience FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin delete work_experience" ON public.work_experience FOR DELETE USING (auth.uid() IS NOT NULL);
