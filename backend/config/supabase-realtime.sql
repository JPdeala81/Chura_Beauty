-- Enable Realtime on notifications and appointments tables
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Add tables to Supabase Realtime system
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE notifications, appointments;
COMMIT;
