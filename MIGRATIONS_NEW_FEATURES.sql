-- SQL Schema Migrations for Chura Site Features
-- Execute these commands in Supabase SQL Editor

-- ============================================
-- ADMINS TABLE - Add new columns
-- ============================================

-- Add role column (for developer role system)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Add hero customization columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_colors JSONB DEFAULT '{"primary": "#d4a574", "secondary": "#b8860b"}';

-- Add favicon customization
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_image TEXT;

-- Add CTA customization columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Consulter';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Réserver';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Bon marché';

-- Add tracking columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add backup security column
ALTER TABLE admins ADD COLUMN IF NOT EXISTS secret_question_backup VARCHAR(255);

-- ============================================
-- SITE_SETTINGS TABLE - Create if not exists + Add new columns
-- ============================================

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_name VARCHAR(255),
  owner_name VARCHAR(255),
  privacy_policy TEXT,
  terms_of_service TEXT,
  about_content TEXT,
  footer_services JSONB,
  footer_custom_links JSONB,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add animation settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';

-- Add CTA customization
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Consulter';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Réserver';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Bon marché';

-- Add favicon customization
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_image TEXT;

-- Add maintenance mode system
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_maintenance BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMP;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;

-- Add site tracking
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_created_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- Create or verify LOGS table for DeveloperDashboard
-- ============================================

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  message TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- ============================================
-- Add indexes for new columns
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_first_login ON admins(is_first_login);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_maintenance ON site_settings(is_maintenance);

-- ============================================
-- Verification: Check schema updates
-- ============================================

-- Run this query to verify all columns were added:
/*
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admins' 
AND column_name IN ('role', 'hero_animation', 'favicon_emoji', 'favicon_image', 'hero_cta_text', 'hero_cta2_text', 'navbar_cta_text', 'admin_btn_text')
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_settings' 
AND column_name IN ('hero_animation', 'favicon_emoji', 'favicon_image', 'is_maintenance', 'maintenance_end', 'maintenance_reason', 'site_created_at')
ORDER BY column_name;
*/
