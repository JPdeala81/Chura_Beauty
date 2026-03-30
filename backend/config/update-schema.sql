ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS secret_question TEXT,
  ADD COLUMN IF NOT EXISTS secret_answer TEXT,
  ADD COLUMN IF NOT EXISTS recovery_email TEXT,
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP,
  ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Révélez Votre Beauté Naturelle',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Des soins d''exception pour sublimer votre beauté',
  ADD COLUMN IF NOT EXISTS hero_bg_color TEXT DEFAULT '#2c1810',
  ADD COLUMN IF NOT EXISTS hero_text_color TEXT DEFAULT '#f8c8d4',
  ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT true;
