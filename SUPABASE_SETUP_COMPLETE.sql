-- ============================================
-- CHURA SITE - Complete Migration & Setup
-- Execute this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name VARCHAR(255),
  owner_name VARCHAR(255),
  is_maintenance BOOLEAN DEFAULT false,
  maintenance_end TIMESTAMP,
  maintenance_reason TEXT,
  hero_animation VARCHAR(50) DEFAULT 'particles',
  favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️',
  favicon_image TEXT,
  hero_cta_text VARCHAR(255) DEFAULT 'Découvrir nos services',
  hero_cta2_text VARCHAR(255) DEFAULT 'Prendre rendez-vous',
  navbar_cta_text VARCHAR(255) DEFAULT 'Prendre RDV',
  admin_btn_text VARCHAR(255) DEFAULT 'Connexion Admin',
  profile_photo TEXT,
  site_created_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Enable RLS and set policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated read" ON site_settings;
DROP POLICY IF EXISTS "Allow service role full access" ON site_settings;

-- Create policies for public read
CREATE POLICY "Allow anonymous read" ON site_settings
  FOR SELECT
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read" ON site_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policies for service role (backend with service key)
CREATE POLICY "Allow service role full access" ON site_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Step 3: Initialize with default data if table is empty
INSERT INTO site_settings (salon_name, owner_name, is_maintenance, maintenance_reason, hero_animation, favicon_emoji)
SELECT 'Chura Beauty', 'Owner', false, '', 'particles', '💆‍♀️'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Step 4: Create logs table if needed
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  message TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_is_maintenance ON site_settings(is_maintenance);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

COMMIT;
