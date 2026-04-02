-- Add QR Code configuration columns to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_enabled BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_mode VARCHAR(50) DEFAULT 'service_info';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_ussd_code VARCHAR(255) DEFAULT '*241#';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_phone_number VARCHAR(20) DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_airtel_number VARCHAR(255) DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS qrcode_moov_number VARCHAR(255) DEFAULT '';

-- Add columns for payment configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_airtel_enabled BOOLEAN DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS payment_moov_enabled BOOLEAN DEFAULT false;

-- Create index for qrcode_enabled for performance
CREATE INDEX IF NOT EXISTS idx_site_settings_qrcode_enabled ON site_settings(qrcode_enabled);

COMMIT;
