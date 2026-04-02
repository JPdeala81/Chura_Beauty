-- Payment System Schema
-- Gabon Payment Networks: Airtel Money & Moov Money

-- ============= PAYMENT SESSIONS TABLE =============
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(20) UNIQUE NOT NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  service_amount DECIMAL(10,2) NOT NULL,
  payment_network VARCHAR(20) NOT NULL CHECK (payment_network IN ('airtel', 'moov')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('qr_scan', 'manual', 'phone_call')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'waiting_confirmation', 'verified', 'completed', 'expired', 'cancelled')),
  payment_reference VARCHAR(255),
  screenshot_url TEXT,
  screenshot_verified BOOLEAN DEFAULT false,
  admin_confirmed BOOLEAN DEFAULT false,
  admin_confirmed_by UUID REFERENCES admins(id),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============= PAYMENT TRANSACTIONS TABLE =============
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('ussd_code_generated', 'qr_scanned', 'screenshot_uploaded', 'verification_started', 'admin_confirmed', 'payment_completed')),
  transaction_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============= HELP SYSTEM - FAQ =============
CREATE TABLE IF NOT EXISTS help_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============= PAYMENT CONFIGURATION =============
CREATE TABLE IF NOT EXISTS payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type VARCHAR(20) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============= INDEXES =============
CREATE INDEX IF NOT EXISTS idx_payment_sessions_customer_phone ON payment_sessions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_created_at ON payment_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_service_id ON payment_sessions(service_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON payment_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_help_faqs_category ON help_faqs(category);
CREATE INDEX IF NOT EXISTS idx_help_faqs_active ON help_faqs(active);

-- ============= INSERT DEFAULT FAQ DATA =============
INSERT INTO help_faqs (category, question, answer, order_index, active, created_by)
SELECT 
  'générale' as category,
  'Qu''est-ce qu''un code de session?' as question,
  'Un code de session est un numéro unique à 8 chiffres que vous recevez pour tracker votre paiement. Conservez-le pour retrouver votre session à tout moment.' as answer,
  1 as order_index,
  true as active,
  (SELECT id FROM admins LIMIT 1) as created_by
WHERE NOT EXISTS (SELECT 1 FROM help_faqs WHERE question = 'Qu''est-ce qu''un code de session?')
UNION ALL
SELECT 'paiement', 'Quels réseaux de paiement acceptez-vous?', 'Nous acceptons Airtel Money et Moov Money pour les clients au Gabon.', 2, true, (SELECT id FROM admins LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM help_faqs WHERE question = 'Quels réseaux de paiement acceptez-vous?')
UNION ALL
SELECT 'paiement', 'Comment payer par QR Code?', 'Scannez le code QR avec votre téléphone, sélectionnez votre réseau (Airtel ou Moov), puis effectuez le paiement USSD selon les instructions.', 3, true, (SELECT id FROM admins LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM help_faqs WHERE question = 'Comment payer par QR Code?')
UNION ALL
SELECT 'paiement', 'Que faire si mon paiement n''est pas confirmé?', 'Si vous avez fourni une preuve de paiement (capture d''écran), attendez la confirmation de l''administrateur. Vous pouvez retrouver votre session avec votre code de session.', 4, true, (SELECT id FROM admins LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM help_faqs WHERE question = 'Que faire si mon paiement n''est pas confirmé?');

-- ============= ENABLE RLS =============
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_config ENABLE ROW LEVEL SECURITY;

-- ============= POLICIES =============
-- Payment Sessions - Allow public read, service role full access
CREATE POLICY "Allow public read payment_sessions" ON payment_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow service role payment_sessions" ON payment_sessions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Payment Transactions - Allow public read
CREATE POLICY "Allow public read payment_transactions" ON payment_transactions
  FOR SELECT USING (true);

CREATE POLICY "Allow service role payment_transactions" ON payment_transactions
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Help FAQs - Public read only
CREATE POLICY "Allow public read help_faqs" ON help_faqs
  FOR SELECT USING (true);

CREATE POLICY "Allow service role help_faqs" ON help_faqs
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Payment Config - Service role only
CREATE POLICY "Allow service role payment_config" ON payment_config
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;
