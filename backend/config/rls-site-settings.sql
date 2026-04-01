-- Set up RLS policies for site_settings table to allow public read access
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read site_settings
CREATE POLICY "Allow anonymous read" ON site_settings
  FOR SELECT
  USING (true);

-- Allow authenticated users to read site_settings  
CREATE POLICY "Allow authenticated read" ON site_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow service role to do anything (for server backend)
CREATE POLICY "Allow service role full access" ON site_settings
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
