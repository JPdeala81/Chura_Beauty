-- Table Admin (unique)
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_name TEXT NOT NULL DEFAULT 'Chura Beauty Salon',
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  bio TEXT,
  profile_picture TEXT,
  cover_picture TEXT,
  instagram TEXT,
  facebook TEXT,
  airtel_code TEXT,
  moov_code TEXT,
  is_payment_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Services
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER DEFAULT 60,
  images TEXT[] DEFAULT '{}',
  main_image_index INTEGER DEFAULT 0,
  display_style TEXT DEFAULT 'card',
  checkbox_options TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Disponibilités
CREATE TABLE availabilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  day_of_week TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  specific_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Rendez-vous
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  client_whatsapp TEXT,
  desired_date DATE NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  selected_options TEXT[] DEFAULT '{}',
  custom_description TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  type TEXT DEFAULT 'new_request',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(desired_date);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_availabilities_service ON availabilities(service_id);
