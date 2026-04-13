-- ============================================
-- CHURA SITE - CompleteMigration for New Features
-- Execute in Supabase SQL Editor
-- ============================================

-- Add role column to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';

-- Add new animation and customization columns to admins
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_image TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir nos services';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Prendre rendez-vous';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Prendre RDV';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Connexion Admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Create site_settings table if it doesn't exist
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
  site_created_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns to site_settings if they don't exist
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_image TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir nos services';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Prendre rendez-vous';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Prendre RDV';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Connexion Admin';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_maintenance BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMP;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS app_name TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS app_logo TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_background_image TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS homepage_hero_title TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS homepage_hero_subtitle TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_phone TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_email TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_whatsapp TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_instagram TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_facebook TEXT;

-- Create logs table for system monitoring
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  message TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_maintenance ON site_settings(is_maintenance);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
