-- Migration: Add client_email column to appointments table
-- Date: 2026-04-13
-- Description: Adds client_email column to store customer email addresses for appointments
-- Status: OPTIONAL - Only if column doesn't exist yet

-- Check if column exists (PostgreSQL)
-- This migration adds the client_email column if it's missing from the appointments table

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);

-- Add comment to document the column
COMMENT ON COLUMN appointments.client_email IS 'Customer email address for the appointment';

-- Note: If this column already exists, the ALTER TABLE statement will be silently ignored
-- The application backend (appointmentController.js) has been updated to handle both cases:
-- 1. If client_email column exists - it will store the email
-- 2. If column doesn't exist - it gracefully falls back and still creates the appointment
