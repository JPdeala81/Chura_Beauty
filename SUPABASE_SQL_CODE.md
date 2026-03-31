⚠️ COPIE UNIQUEMENT LE CODE CI-DESSOUS (PAS CETTE LIGNE!)

COMMENCE À PARTIR DE "CREATE TABLE" JUSQU'AU DERNIER "ON CONFLICT DO NOTHING;"

---

## CODE SQL - COPIE TOUT CECI DANS SUPABASE:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  category VARCHAR(100),
  duration_minutes INT,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(100),
  specialties TEXT,
  image_url VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percent DECIMAL(5, 2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.categories (name, description) VALUES
  ('Coiffure', 'Services de coiffure'),
  ('Coloration', 'Services de coloration'),
  ('Ongles', 'Manucure et pedicure'),
  ('Massage', 'Services de massage'),
  ('Soins', 'Soins du visage et du corps')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (title, description, price, category, duration_minutes) VALUES
  ('Coupe femme', 'Coupe classique pour femme', 35.00, 'Coiffure', 45),
  ('Coupe homme', 'Coupe classique pour homme', 25.00, 'Coiffure', 30),
  ('Coloration complète', 'Coloration et soin', 65.00, 'Coloration', 120),
  ('Manucure', 'Manucure classique', 25.00, 'Ongles', 30),
  ('Pédicure', 'Pédicure complète', 30.00, 'Ongles', 45),
  ('Massage relaxant', 'Massage 60 minutes', 80.00, 'Massage', 60),
  ('Soin du visage', 'Soin complet', 55.00, 'Soins', 60)
ON CONFLICT DO NOTHING;

INSERT INTO public.team (name, email, phone, role, specialties) VALUES
  ('Marie Dupont', 'marie@chura-beauty.dev', '06 12 34 56 78', 'Coiffeuse', 'Coupe, Coloration'),
  ('Sophie Bernard', 'sophie@chura-beauty.dev', '06 23 45 67 89', 'Esthéticienne', 'Soins, Massage'),
  ('Anne Martin', 'anne@chura-beauty.dev', '06 34 56 78 90', 'Manucure', 'Ongles')
ON CONFLICT DO NOTHING;

INSERT INTO public.users (email, password_hash, full_name, phone, role) VALUES
  ('client@chura-beauty.dev', 'hashed_password_here', 'Client Test', '06 11 22 33 44', 'customer'),
  ('developer@chura-beauty.dev', 'hashed_password_here', 'Developer', '06 55 66 77 88', 'developer')
ON CONFLICT DO NOTHING;

INSERT INTO public.admins (email, password_hash, full_name, role) VALUES
  ('admin@chura-beauty.dev', 'hashed_password_here', 'Admin User', 'admin'),
  ('developer@chura-beauty.dev', 'hashed_password_here', 'Developer', 'developer')
ON CONFLICT DO NOTHING;

---

✅ FIN DO CODE - C'EST TOUT!

Après avoir cliqué RUN dans Supabase:
1. Attends le message: ✅ **Query executed successfully**
2. Va dans: **Table Editor** (panneau gauche)
3. Vérifie que les 9 tables apparaissent

PHASE 1 TERMINÉE!
