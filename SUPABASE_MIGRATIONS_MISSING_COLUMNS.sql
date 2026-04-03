-- ============================================
-- SUPABASE SQL MIGRATIONS
-- Add Missing Columns to site_settings Table
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- and execute it to add all missing columns

-- ============================================
-- SITE_SETTINGS TABLE - Add all missing columns
-- ============================================

-- Core Settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS app_name VARCHAR(255) DEFAULT 'Chura Beauty';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS salon_name VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255);

-- Homepage Hero Section
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS homepage_hero_title VARCHAR(255) DEFAULT 'Bienvenue';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS homepage_hero_subtitle VARCHAR(255) DEFAULT 'Services de beauté premium';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tagline VARCHAR(255) DEFAULT 'Excellence et élégance';

-- Images & Media
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS app_logo TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_background_image TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_emoji VARCHAR(10) DEFAULT '💆‍♀️';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS favicon_image TEXT;

-- Footer Information
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_company_name VARCHAR(255) DEFAULT 'Chura Beauty Salon';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_address TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_phone VARCHAR(20);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_email VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_whatsapp VARCHAR(20);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_instagram VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_facebook VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_twitter VARCHAR(255);

-- Footer Custom Elements (JSON arrays)
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_services JSONB;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_custom_links JSONB;

-- Legal & Policy Pages
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS privacy_policy TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS terms_of_service TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_content TEXT;

-- Meta/SEO
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- CTA Buttons
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_text VARCHAR(255) DEFAULT 'Découvrir maintenant';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta2_text VARCHAR(255) DEFAULT 'Consulter';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS navbar_cta_text VARCHAR(255) DEFAULT 'Réserver';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS admin_btn_text VARCHAR(255) DEFAULT 'Bon marché';

-- Maintenance & Status
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_maintenance BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_end TIMESTAMP;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;

-- Database Features
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_enabled BOOLEAN DEFAULT true;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_mode VARCHAR(50) DEFAULT 'service_info';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_ussd_code VARCHAR(50) DEFAULT '*241#';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_phone_number VARCHAR(20);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_airtel_number VARCHAR(20);
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_moov_number VARCHAR(20);

-- Payment Configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS is_payment_enabled BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS moov_code VARCHAR(20);

-- Timestamps
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS site_created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================
-- Create or Update Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_site_settings_is_maintenance ON site_settings(is_maintenance);
CREATE INDEX IF NOT EXISTS idx_site_settings_qrcode_enabled ON site_settings(qrcode_enabled);
CREATE INDEX IF NOT EXISTS idx_site_settings_created_at ON site_settings(created_at);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after the migrations to verify all columns exist:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_settings' ORDER BY ordinal_position;
