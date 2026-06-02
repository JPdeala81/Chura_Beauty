-- Migration: Add hero_card_media columns to site_settings table
-- Run this in Supabase SQL Editor

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_card_media TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_card_media_type TEXT DEFAULT 'image';
