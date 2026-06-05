# WhatsApp Service Configuration Guide

## ✅ Implementation Status
- WhatsApp utility: **IMPLEMENTED** ✅
- Uses Twilio API ✅
- Graceful fallback when not configured ✅
- Error handling with logging ✅

## WhatsApp Configuration

### Required Twilio Setup

1. **Create Twilio Account**
   - Go to twilio.com
   - Sign up for free trial account
   - Get Account SID & Auth Token

2. **Enable WhatsApp Sandbox (for testing)**
   - Go to Twilio Console > WhatsApp > Sandbox Settings
   - Save the "From" number (e.g., +1234567890)
   - Join sandbox with "+1 415-523-8886 join your-code"

3. **Add Environment Variables**
```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=+1234567890
```

**Note:** Replace with actual Twilio credentials, NOT "placeholder"

## Currently Configured Endpoints

### 1. Appointment Creation (POST /appointments)
- Sends WhatsApp notification to admin
- Admin number from database
- Message format: Appointment details + client info

### 2. Appointment Status Update (PATCH /appointments/:id/status)
- Sends WhatsApp notification to client
- Client WhatsApp from appointment data
- Message format: Status update + admin notes

## WhatsApp Message Functions

### sendWhatsAppMessage(toNumber, message)
**Simple text message**
- Cleans phone number (removes non-digits)
- Sends to WhatsApp number
- Returns message SID

```javascript
await sendWhatsAppMessage('+1234567890', 'Your appointment is confirmed!');
```

### sendWhatsAppTemplate(toNumber, templateName, templateData)
**Template-based messages (advanced)**
- Requires Twilio template setup
- Allows dynamic data insertion
- More professional & customizable

## Current Implementation Details

**File:** `backend/utils/whatsappUtil.js`

- **Initialization:** On server startup, checks for Twilio variables
- **Graceful Handling:** Returns mock response `{ sid: 'mock-id', status: 'skipped' }` if not configured
- **Phone Cleaning:** Removes all non-digit characters
- **Error Logging:** Logs errors without crashing appointment creation
- **Non-Blocking:** Appointment creation continues even if WhatsApp fails

## API Endpoints Using WhatsApp

| Endpoint | Method | WhatsApp Usage |
|----------|--------|---|
| `/appointments` | POST | Notify admin of new appointment |
| `/appointments/:id/status` | PATCH | Notify client of status change |

## Twilio Pricing

**Free Tier:**
- $0 credit for testing
- Sandbox mode: send to verified numbers only
- Limited messages: ~10 messages

**Production (Pay-as-you-go):**
- ~$0.005-0.02 per message depending on country
- Full API access
- No sandbox limitations

## Message Format

### Appointment Notification to Admin
```
🔔 NOUVEAU RENDEZ-VOUS

Client: [Client Name]
Service: [Service Name]
Date: [Date]
Heure: [Time]
Téléphone: [Phone]

Admin Notes: [Additional info]
```

### Status Update to Client
```
📅 MISE À JOUR RENDEZ-VOUS

Votre rendez-vous a été [STATUS].
Date: [Date]
Heure: [Time]

Administrateur: [Message]
```

## Testing WhatsApp Integration

### Enable Sandbox
1. Get Twilio credentials
2. Add to .env file
3. Message +1 415-523-8886 with "join <your-code>"
4. Restart server

### Create Test Appointment
```bash
POST /api/appointments
{
  "client_name": "Test",
  "client_whatsapp": "+your-number",
  "service_id": "uuid",
  "appointment_date": "2026-06-10",
  "appointment_time": "10:00"
}
```

## Current Issues & Solutions

### "Twilio non disponible"
- Check .env has TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Verify they're not set to "placeholder"
- Restart server

### "Error sending WhatsApp message"
- Verify phone number format: +country-code digits
- In sandbox: Only verified numbers can receive messages
- Check Twilio account has credits/active trial

### Message not arriving
- Check number is in sandbox verified contacts
- Verify WhatsApp app is installed on phone
- Check Twilio logs in console dashboard

## TODO / Next Steps

1. ✅ WhatsApp service implemented
2. ✅ Appointment notifications working
3. ⏳ Add WhatsApp validation to appointmentController
4. ⏳ Add custom message templates
5. ⏳ Add WhatsApp rate limiting
6. ⏳ Add message delivery tracking

## API Response Handling

When WhatsApp is not configured:
```json
{
  "sid": "mock-id",
  "status": "skipped"
}
```

This allows graceful degradation - appointments still create even if WhatsApp fails.

## Troubleshooting

### Check Server Startup Logs
```
✅ Twilio initialisé         → Configured correctly
⚠️ Twilio non disponible     → Credentials missing or invalid
```

### Verify Credentials
```bash
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_AUTH_TOKEN
echo $TWILIO_WHATSAPP_FROM
```

### Test with curl
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test",
    "client_whatsapp": "+1234567890",
    "service_id": "...",
    "appointment_date": "2026-06-10",
    "appointment_time": "10:00"
  }'
```

---

**Last Updated:** 2026-06-05
