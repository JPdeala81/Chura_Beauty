# Email Service Configuration Guide

## ✅ Implementation Status
- Email utility: **IMPLEMENTED** ✅
- Supports Gmail & Custom SMTP ✅
- Graceful fallback when not configured ✅

## Email Configuration Options

### Option 1: Gmail (Recommended for testing)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note:** Use Gmail App Password, not your regular password:
1. Enable 2-Factor Authentication
2. Go to myaccount.google.com/apppasswords
3. Generate app password for "Mail" on "Other"
4. Use generated password as EMAIL_PASSWORD

### Option 2: Custom SMTP
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM=noreply@example.com
```

## Currently Configured Endpoints

### 1. POST /auth/forgot-password
- Sends password reset email
- Validates email format
- Token expires in 30 minutes
- HTML formatted email with reset link

### 2. POST /auth/recover-with-question (TODO: Add validation)
- Sends recovery email via security question
- Validates secret answer

### 3. POST /auth/reset-password/:token (TODO: Add validation)
- Resets password using token
- Token must be valid and not expired

## Testing Email Service

### Manual Test in .env file:
```bash
# Add to .env for testing
EMAIL_USER=your-test-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Test endpoint (once added):
POST /api/auth/test-email
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<h1>This is a test</h1>"
}
```

## Current Implementation Details

**File:** `backend/utils/emailUtil.js`

- **Initialization:** On server startup, checks for EMAIL or SMTP variables
- **Graceful Handling:** Returns error if transporter not initialized
- **Logging:** Logs success/failure of email sends
- **HTML Support:** Supports rich HTML email content

## API Endpoints Using Email

| Endpoint | Method | Email Usage |
|----------|--------|------------|
| `/auth/forgot-password` | POST | Password reset |
| `/auth/recover-with-question` | POST | Recovery email |
| `/auth/reset-password/:token` | POST | Confirmation |

## TODO / Next Steps

1. ✅ Email service implemented
2. ✅ Validation added to forgotPassword
3. ⏳ Add validation to recoverWithQuestion
4. ⏳ Add validation to resetPassword
5. ⏳ Add test endpoint for email verification
6. ⏳ Add email rate limiting (prevent spam)

## Troubleshooting

### "Service email non configuré"
- Check .env file has EMAIL_USER/EMAIL_PASSWORD or SMTP_* variables
- Restart server after adding variables
- Check console logs for initialization messages

### "Error sending email"
- Verify email/password is correct
- Check SMTP server is accessible
- Gmail: Verify app password is correct (not regular password)
- Check firewall/network doesn't block SMTP port

### Emails not arriving
- Check spam/junk folder
- Verify FROM email address is correct
- Check email logs in Gmail/mail provider

---

**Last Updated:** 2026-06-05
