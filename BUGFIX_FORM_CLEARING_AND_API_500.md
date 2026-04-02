## Instructions to Fix API 500 Error - Site Settings

### Problem
Users were experiencing a 500 error when saving site settings and form clearing issues in the dashboards.

### Cause
1. **Auto-refetch causing form clearing**: The dashboard was refetching data every 5 seconds, which reset the form when users were typing.
2. **Missing backend field support**: The backend wasn't accepting the new `hero_background_image` field.
3. **Missing database columns**: The `site_settings` table in Supabase was missing several columns.

### Solution Applied

#### Frontend Fixes (Already Applied):
- ✅ Disabled auto-refetch when editing forms (only refetch when not editing)
- ✅ Added `hero_background_image` field to form state
- ✅ Updated both SuperAdminDashboard and DeveloperDashboard

#### Backend Fixes (Already Applied):
- ✅ Updated `updateSiteSettings` controller to accept new fields
- ✅ Added missing field extraction in controller

#### Database Migration (REQUIRED):
You need to run this SQL in Supabase to add missing columns:

```sql
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS app_name TEXT DEFAULT 'Chura Beauty',
ADD COLUMN IF NOT EXISTS hero_background_image TEXT,
ADD COLUMN IF NOT EXISTS homepage_hero_title TEXT DEFAULT 'Révélez Votre Beauté Naturelle',
ADD COLUMN IF NOT EXISTS homepage_hero_subtitle TEXT DEFAULT 'Des soins d''exception pour sublimer votre beauté',
ADD COLUMN IF NOT EXISTS tagline TEXT DEFAULT 'Excellence et élégance',
ADD COLUMN IF NOT EXISTS footer_company_name TEXT DEFAULT 'Chura Beauty Salon',
ADD COLUMN IF NOT EXISTS footer_address TEXT,
ADD COLUMN IF NOT EXISTS footer_phone TEXT,
ADD COLUMN IF NOT EXISTS footer_email TEXT,
ADD COLUMN IF NOT EXISTS footer_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS footer_instagram TEXT,
ADD COLUMN IF NOT EXISTS footer_facebook TEXT,
ADD COLUMN IF NOT EXISTS footer_twitter TEXT;
```

### Steps to Apply

1. **Go to Supabase Dashboard** (https://app.supabase.io)
2. **Navigate to SQL Editor**
3. **Create a new query**
4. **Copy and paste the SQL above**
5. **Run the query**
6. **Verify by checking the site_settings table in Table Editor**

### Testing After Migration

1. ✅ Try to edit profile in DeveloperDashboard - should no longer clear form while typing
2. ✅ Save profile - should save successfully
3. ✅ Edit site settings - should no longer clear form while typing
4. ✅ Save site settings - should not give 500 error anymore
5. ✅ Upload hero background image - should save successfully

### Files Changed
- `frontend/src/pages/admin/SuperAdminDashboard.jsx`
- `frontend/src/pages/admin/DeveloperDashboard.jsx`
- `backend/controllers/siteSettingsController.js`
- `backend/config/migration-add-site-settings-columns.sql` (new)

### Commit Hash
`5a87151` - 🔧 Fix Form Clearing Issues & API 500 Errors
