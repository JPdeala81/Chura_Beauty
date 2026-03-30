-- Migration: Add client_email to appointments table
-- This migration adds an email column to store client email addresses for appointments

ALTER TABLE appointments 
ADD COLUMN client_email TEXT;

-- Update existing appointments to have a placeholder email if needed
UPDATE appointments 
SET client_email = 'contact@salon.com' 
WHERE client_email IS NULL;

-- Make the column non-null after data migration (optional, uncomment if desired)
-- ALTER TABLE appointments 
-- ALTER COLUMN client_email SET NOT NULL;

-- Add index for email queries (optional for performance)
CREATE INDEX idx_appointments_email ON appointments(client_email);
