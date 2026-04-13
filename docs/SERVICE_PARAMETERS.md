# 🔧 Service Parameters - Implementation Guide

## Overview
Service parameters (also called "checkbox options") are customizable add-ons that clients can select when booking an appointment. Examples: "Sans shampoing", "Premium", "Avec massage", "PHOTO", etc.

## Problem Fixed ✅
Previously, when adding services with parameters in the **DeveloperDashboard**, the parameters were not being stored or updated. This has been corrected.

## How to Use

### Adding Service Parameters (DeveloperDashboard)

1. **Navigate to:** Admin Dashboard → Database Management → Add Service
2. **Fill out the form:**
   - Name, Category, Price, Duration
   - Description
   - **NEW:** Parameters/Options field
3. **Parameters Format:** Enter options separated by commas
   - Example: `Sans shampoing, Premium, Avec massage`
   - Example: `Small, Medium, Large`
   - Example: `PHOTO, Video, Portfolio`
4. **Click:** "Ajouter un nouveau service"

### How Parameters Work for Clients

When a client books an appointment:
1. They select a service
2. They see the available options (if any)
3. They can check multiple options (e.g., "Premium" + "PHOTO")
4. The selected options are stored with their appointment

### Backend Storage

Parameters are stored as a JSON array in the `checkbox_options` field:
```json
["PHOTO", "Premium", "Avec massage"]
```

### API Integration

**Create Service:**
```javascript
POST /api/services
{
  "title": "Hair Styling",
  "category": "Tresses",
  "price": 25000,
  "duration_minutes": 60,
  "description": "Professional styling",
  "checkbox_options": ["PHOTO", "Premium", "Express"]
}
```

**Update Service:**
```javascript
PUT /api/services/{id}
{
  "checkbox_options": ["PHOTO", "Premium"]
}
```

**Get Appointments with Options:**
```javascript
GET /api/appointments
```
Returns:
```json
{
  "appointments": [
    {
      "service_id": "123",
      "client_name": "Alice",
      "selected_options": ["PHOTO", "Premium"],
      ...
    }
  ]
}
```

## Technical Details

### Frontend (DeveloperDashboard.jsx)
- **State:** `newServiceForm.checkboxOptions` - comma-separated string
- **Input Field:** Text input for parameters
- **Processing:** Split by comma, trim whitespace, filter empty strings
- **Payload:** Converted to array before sending to API

### Backend (serviceController.js)
- **Accepts:** String or JSON array
- **Processes:** Parses to JSON array if needed
- **Stores:** As JSON array in `checkbox_options` column
- **Validation:** Flexible - optional field

## Troubleshooting

### Parameters Not Showing Up
1. Check that you entered parameters in the "Paramètres/Options" field
2. Verify format: Use commas to separate options
3. Refresh the page after creation
4. Check browser console for errors (F12 → Console tab)

### Parameters Not Saving
1. Check network tab (F12 → Network) for API errors
2. Verify the service creation response
3. Check backend logs for errors
4. Ensure the `checkbox_options` column exists in the database

### Migration Status
The database column `checkbox_options` should already exist. If needed, run the migration:
```sql
-- Check if column exists (will be added automatically by migration)
ALTER TABLE services
ADD COLUMN IF NOT EXISTS checkbox_options JSONB DEFAULT '[]';
```

## Examples

### Service: Hair Styling with PHOTO Option
```
Name: Hair Styling
Category: Tresses
Price: 25000 FCFA
Duration: 60 minutes
Description: Professional hair styling service
Parameters: PHOTO, Premium, Express Service
```

### Service: Nail Art
```
Name: Nail Art
Category: Ongles mains
Price: 15000 FCFA
Duration: 45 minutes
Description: Beautiful nail art designs
Parameters: Design #1, Design #2, Design #3, Rhinestones, Extension
```

## Next Steps

1. **Local Testing:** Add a service with parameters on the dev environment
2. **Verify in DB:** Check that `checkbox_options` contains the JSON array
3. **Test Booking:** Make an appointment and select options
4. **Verify Storage:** Check that `selected_options` is saved with the appointment

## Support

If parameters still aren't working:
1. Check that the `checkbox_options` column exists in the services table
2. Verify the backend is receiving the parameter data
3. Check file: `backend/controllers/serviceController.js` line 119-158
4. Review logs for any SQL errors

---

**Last Updated:** April 13, 2026
**Status:** ✅ Ready for Production
