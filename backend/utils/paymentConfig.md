# Payment Service Configuration Guide

## ⚠️ Current Status
- Payment routes: **IMPLEMENTED** ✅
- Payment endpoints exist: ✅
- **Provider integration: NEEDS CLARIFICATION** ⏳

## Payment Endpoints Available

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/payments/sessions` | POST | Create payment session |
| `/payments/sessions/:sessionCode` | GET | Get session status |
| `/payments/sessions/:sessionId/confirm` | POST | Confirm payment |
| `/payments/sessions/:sessionId/reject` | POST | Reject payment |
| `/payments/sessions/:sessionId/screenshot` | POST | Upload payment screenshot |
| `/payments/faqs` | GET | Get payment FAQs |
| `/payments/faqs/:faqId` | DELETE | Delete FAQ |
| `/payments/faqs` (POST) | POST | Create FAQ |
| `/payments/sessions` | GET | Get all sessions |

## Payment Integration Options

### Option 1: Stripe (Recommended - Most Popular)
**Pros:**
- Industry standard
- Great documentation
- Test mode available
- Good security

**Cons:**
- Requires account verification
- International payments fees

**Setup:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Option 2: PayPal
**Pros:**
- Global coverage
- Familiar to users
- Good sandbox

**Cons:**
- More complex integration
- Higher fees

**Setup:**
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

### Option 3: Razorpay (for India/Asia)
**Pros:**
- Low fees
- Easy integration
- Great for Asia

**Cons:**
- India-specific initially

**Setup:**
```
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

### Option 4: Manual/Bank Transfer
**Current approach:** Possibly using screenshot uploads for manual verification

**Files:**
- `backend/controllers/paymentController.js`
- Route: `POST /payments/sessions/:sessionId/screenshot`

## Current Implementation

**File:** `backend/controllers/paymentController.js`

### Session Creation
```
POST /payments/sessions
{
  "service_id": "uuid",
  "appointment_id": "uuid",
  "amount": 50000,
  "currency": "XOF"
}

Returns: { sessionCode, sessionId, status }
```

### Session Status
```
GET /payments/sessions/:sessionCode
Returns: { sessionId, status, confirmationCode }
```

### Payment Confirmation
```
POST /payments/sessions/:sessionId/confirm
{
  "transactionId": "..."
}
Returns: { status: "confirmed" }
```

### Payment Rejection
```
POST /payments/sessions/:sessionId/reject
{
  "reason": "..."
}
Returns: { status: "rejected" }
```

### Screenshot Upload (Manual verification)
```
POST /payments/sessions/:sessionId/screenshot
{
  "screenshot": <binary image data>
}
Returns: { uploaded: true }
```

## Payment Flow

### Manual Payment Flow (if not provider-integrated):
1. Client initiates payment
2. Server creates payment session
3. Client makes manual bank transfer / payment
4. Client uploads proof/screenshot
5. Admin verifies manually
6. Session marked as confirmed

### Stripe Flow (if integrated):
1. Client initiates payment
2. Server creates Stripe session
3. Client redirected to Stripe checkout
4. Payment processed
5. Webhook confirms payment
6. Session marked as confirmed

## TODO / Next Steps

1. **Clarify which payment provider to use**
   - [ ] Stripe
   - [ ] PayPal
   - [ ] Razorpay
   - [ ] Manual/Bank Transfer

2. **Implement chosen provider**
   - [ ] Install SDK
   - [ ] Add environment variables
   - [ ] Update paymentController.js

3. **Add validation**
   - [ ] Validate amount is positive
   - [ ] Validate currency is valid
   - [ ] Validate session IDs exist

4. **Add webhooks** (for provider-based payments)
   - [ ] Stripe webhook handler
   - [ ] PayPal webhook handler
   - [ ] Razorpay webhook handler

5. **Add error handling**
   - [ ] Handle payment failures
   - [ ] Handle network errors
   - [ ] Add retry logic

## Recommended Configuration

For simplicity, start with **Manual Payment** (current setup):
- Uses screenshots
- Admin approval workflow
- No external dependencies
- Works in all countries

Then upgrade to **Stripe** (for automation):
- Reduces manual work
- Instant payments
- Better security
- Professional

## Environment Variables Checklist

```
# If using Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# If using PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# If using Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# General
CURRENCY=XOF
WEBHOOK_SECRET=
```

## Security Considerations

1. **Never expose secret keys** in frontend
2. **Always validate amount** before processing
3. **Use HTTPS** for all payment requests
4. **Verify webhook signatures** from payment provider
5. **Never log payment data** (PCI compliance)
6. **Use idempotency keys** to prevent duplicate charges
7. **Validate session ownership** before confirming

## Testing Payments

### Manual Payment Test
1. Create appointment
2. Initiate payment session
3. Upload test screenshot
4. Verify in database

### Stripe Test (if integrated)
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

### PayPal Test (if integrated)
- Use sandbox credentials
- Create sandbox buyer account

## Payment Status Lifecycle

```
pending → (payment made) → confirmed → settled
   ↓
  rejected
```

## Current Database Schema

**Payment Sessions Table:**
- `id` (uuid, primary key)
- `session_code` (unique code for frontend)
- `amount` (decimal)
- `currency` (string: XOF, USD, etc)
- `status` (pending/confirmed/rejected)
- `appointment_id` (foreign key)
- `created_at` (timestamp)
- `confirmed_at` (timestamp, nullable)
- `transaction_id` (string, nullable)

## API Response Examples

### Success Response
```json
{
  "success": true,
  "sessionCode": "PAY-ABC123",
  "sessionId": "uuid-...",
  "status": "pending",
  "amount": 50000,
  "currency": "XOF"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid session ID",
  "status": 400
}
```

---

**Recommendation:** Implement **Manual Payment** first, then add **Stripe** integration for automation.

**Last Updated:** 2026-06-05
