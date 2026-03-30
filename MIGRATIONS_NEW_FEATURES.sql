-- SQL Schema Migrations for Chura Site Features
-- Execute these commands in Supabase SQL Editor

-- ============================================
-- ADMINS TABLE - Add new columns
-- ============================================

ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS favicon_image TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Consulter';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Réserver';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Bon marché';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS created_by UUID;

-- ============================================
-- SITE_SETTINGS TABLE
-- ============================================

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
  hero_animation VARCHAR(50) DEFAULT 'particles',
  favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️',
  favicon_image TEXT,
  hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant',
  hero_cta2_text VARCHAR(255) DEFAULT 'Consulter',
  navbar_cta_text VARCHAR(255) DEFAULT 'Réserver',
  admin_btn_text VARCHAR(255) DEFAULT 'Bon marché',
  is_maintenance BOOLEAN DEFAULT false,
  maintenance_end TIMESTAMP,
  maintenance_reason TEXT,
  site_created_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ADD columns if table already exists

ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_animation VARCHAR(50) DEFAULT 'particles';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_image TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Consulter';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Réserver';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Bon marché';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_maintenance BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMP;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_created_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL,
  message TEXT,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_maintenance ON site_settings(is_maintenance);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
