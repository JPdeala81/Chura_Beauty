-- Add missing columns to site_settings table for hero background image support
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'Chura Beauty',
ADD COLUMN IF NOT EXISTS hero_background_image TEXT,
ADD COLUMN IF NOT EXISTS homepage_hero_title TEXT DEFAULT 'Révélez Votre Beauté Naturelle',
ADD COLUMN IF NOT EXISTS homepage_hero_subtitle TEXT DEFAULT 'Des soins d''exception pour sublimer votre beauté',
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Excellence et élégance',
ADD COLUMN IF NOT EXISTS footer_company_name TEXT DEFAULT 'Chura Beauty Salon',
ADD COLUMN IF NOT EXISTS footer_address TEXT,
ADD COLUMN IF NOT EXISTS footer_phone TEXT,
ADD COLUMN IF NOT EXISTS footer_email TEXT,
ADD COLUMN IF NOT EXISTS footer_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS footer_instagram TEXT,
ADD COLUMN IF NOT EXISTS footer_facebook TEXT,
ADD COLUMN IF NOT EXISTS footer_twitter TEXT;

-- Comment: This migration adds support for:
-- - Hero background image upload (hero_background_image)
-- - App branding fields
-- - Extended footer configuration
-- - Hero section customization
