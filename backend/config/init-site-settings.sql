-- Initialize site_settings with a default row if empty
INSERT INTO site_settings (salon_name, owner_name, is_maintenance, maintenance_reason, hero_animation, favicon_emoji)
SELECT 'Chura Beauty', 'Owner', false, '', 'particles', '💆‍♀️'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
