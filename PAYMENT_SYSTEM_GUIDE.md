# Payment System Implementation Guide

## Overview
Complete payment system for Chura Beauty Salon supporting Gabon payment networks (Airtel Money & Moov Money) with USSD, QR codes, and manual payment verification.

## Database Setup

### Step 1: Run Migration
Execute `PAYMENT_SYSTEM_SCHEMA.sql` in your Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Create new query  
3. Paste contents of `PAYMENT_SYSTEM_SCHEMA.sql`
4. Click ▶ Run

This creates:
- `payment_sessions` - Main payment session tracking
- `payment_transactions` - Audit trail of all payment events
- `help_faqs` - Customer help/FAQ system
- `payment_config` - Payment configuration storage
- Default FAQ entries in French

### Step 2: QR Code Columns
Execute `ADD_QRCODE_CONFIG.sql` for QR code configuration:
- `qrcode_enabled` - Enable/disable QR payments
- `qrcode_mode` - 'service_info' or 'ussd_call'
- `qrcode_ussd_code` - USSD code template
- `qrcode_phone_number` - Admin phone for callbacks
- Payment network configuration columns

## Backend API Endpoints

### Public Endpoints

#### Create Payment Session
```
POST /api/payments/sessions
Body: {
  serviceId: UUID,
  customerName: string,
  customerPhone: string,
  serviceAmount: number,
  paymentNetwork: 'airtel' | 'moov',
  paymentMethod: 'qr_scan' | 'manual' | 'phone_call'
}
Response: { session: PaymentSession }
```

#### Get Payment Session
```
GET /api/payments/sessions/{sessionCode}
Response: PaymentSession
```

#### Get All FAQs
```
GET /api/payments/faqs
GET /api/payments/faqs?category=générale
Response: FAQ[]
```

#### Get FAQ Categories
```
GET /api/payments/faqs/categories
Response: string[]
```

### Protected Endpoints (Admin)

#### Upload Payment Screenshot
```
POST /api/payments/sessions/{sessionId}/screenshot
Body: {
  screenshotUrl: string,
  paymentReference?: string
}
Response: { session: PaymentSession }
```

#### Confirm Payment
```
POST /api/payments/sessions/{sessionId}/confirm
Body: { adminNotes?: string }
Response: { session: PaymentSession }
```

#### Reject Payment
```
POST /api/payments/sessions/{sessionId}/reject
Body: { reason: string }
Response: { session: PaymentSession }
```

#### Get Payment Sessions
```
GET /api/payments/sessions
GET /api/payments/sessions?status=pending&days=30
Response: PaymentSession[]
```

#### Create FAQ
```
POST /api/payments/faqs
Body: {
  category: string,
  question: string,
  answer: string,
  orderIndex?: number
}
Response: { faq: FAQ }
```

#### Delete FAQ
```
DELETE /api/payments/faqs/{faqId}
```

## Frontend Components

### 1. PaymentFlow Component
Multi-step payment wizard.

```jsx
import PaymentFlow from '@/components/payments/PaymentFlow'

<PaymentFlow
  service={serviceObject}
  onSuccess={() => console.log('Payment completed')}
  onCancel={() => console.log('Payment cancelled')}
/>
```

**Features:**
- Step 1: Customer info entry
- Step 2: Payment method selection
- Step 3: Network selection (Airtel/Moov)
- Step 4: USSD code display with copy button
- Step 5: Screenshot upload for verification

**Generated USSD Codes:**
- Moov Money: `*555*2*{adminNumber}*{amount}#`
- Airtel Money: `*150*2*1*{adminNumber}*{amount}#`

### 2. HelpCenter Component
FAQ listing system with categories.

```jsx
import HelpCenter from '@/components/payments/HelpCenter'

<HelpCenter />
```

**Features:**
- Category filtering
- Expandable questions/answers
- Loads from backend API
- Responsive design

### 3. SessionRecovery Component
Find payment session by 8-digit code.

```jsx
import SessionRecovery from '@/components/payments/SessionRecovery'

<SessionRecovery
  onSessionFound={(session) => console.log(session)}
  onClose={() => console.log('Closed')}
/>
```

## Integration Examples

### Example 1: Add Payment to Service Detail Page

```jsx
// In ServiceDetail.jsx
import { useState } from 'react'
import PaymentFlow from '../components/payments/PaymentFlow'

export default function ServiceDetail() {
  const [showPayment, setShowPayment] = useState(false)

  return (
    <>
      {/* Existing content */}
      
      {showPayment ? (
        <PaymentFlow
          service={service}
          onSuccess={() => {
            setShowPayment(false)
            alert('✅ Paiement enregistré!')
          }}
          onCancel={() => setShowPayment(false)}
        />
      ) : (
        <button
          onClick={() => setShowPayment(true)}
          className="btn btn-luxury-appointment"
        >
          💳 Payer en ligne
        </button>
      )}
    </>
  )
}
```

### Example 2: Add Help Center to Navigation

```jsx
// In Footer.jsx or new Help page
import HelpCenter from '../components/payments/HelpCenter'

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <div className="container py-5">
        <HelpCenter />
      </div>
      <Footer />
    </>
  )
}
```

### Example 3: Admin Payment Dashboard

```jsx
// In SuperAdminDashboard.jsx or new PaymentAdmin component
import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function PaymentsTab() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const loadSessions = async () => {
      const res = await api.get('/payments/sessions?status=waiting_confirmation')
      setSessions(res.data)
    }
    loadSessions()
  }, [])

  return (
    <div>
      <h5>Paiements En Attente</h5>
      {sessions.map(session => (
        <div key={session.id} className="card mb-2">
          <div className="card-body">
            <h6>{session.customer_name}</h6>
            <p>Code: {session.session_code}</p>
            <p>Montant: {session.service_amount} XAF</p>
            <p>Réseau: {session.payment_network}</p>
            {session.screenshot_url && (
              <img src={session.screenshot_url} alt="Screenshot" style={{maxWidth: '200px'}} />
            )}
            <button
              onClick={() => confirmPayment(session.id)}
              className="btn btn-success btn-sm"
            >
              ✅ Confirmer
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## USSD Payment Networks

### Moov Money (Gabon)
- Prefix: +241 65, +241 66, +241 76
- Payment Code: `*555*2*{ADMIN_NUMBER}*{AMOUNT}#`
- Example: `*555*2*24277123456*5000#`

### Airtel Money (Gabon)
- Prefix: +241 74, +241 77
- Payment Code: `*150*2*1*{ADMIN_NUMBER}*{AMOUNT}#`
- Example: `*150*2*1*24277123456*5000#`

## Session Management

### Session Code
- 8-digit unique identifier
- Used by customers to track payments
- Recoverable via SessionRecovery component
- Example: 12345678

### Session Statuses
- `pending` - Initial state
- `waiting_confirmation` - Screenshot uploaded
- `verified` - Verified by system
- `completed` - Admin confirmed
- `expired` - After 24 hours
- `cancelled` - Rejected by admin

### Expiration
- Default: 24 hours from creation
- Automatically marked as expired on next access

## Payment Flow Diagram

```
Customer Info Entry
    ↓
Payment Method Selection (QR/Manual/AutoDial)
    ↓
Network Selection (Moov/Airtel)
    ↓
Session Created → Unique Code Generated
    ↓
Display USSD Code + Copy Option
    ↓
Customer Makes Payment
    ↓
Upload Screenshot (Optional) OR Admin Manual Verification
    ↓
Admin Reviews Payment
    ↓
Confirm → Payment Complete
or
Reject → Payment Cancelled
```

## Admin Management Features

### View All Payments
```jsx
const res = await api.get('/payments/sessions?days=30&status=completed')
```

### Confirm Payment
```jsx
await api.post(`/payments/sessions/${sessionId}/confirm`, {
  adminNotes: 'Verified and confirmed'
})
```

### Manage FAQs
```jsx
// Create FAQ
await api.post('/payments/faqs', {
  category: 'paiement',
  question: 'How to pay?',
  answer: 'You can pay via...',
  orderIndex: 1
})

// Delete FAQ
await api.delete(`/payments/faqs/${faqId}`)
```

## Security Features

### Row Level Security (RLS)
- Public read access for FAQ and session info
- Admin-only write access for confirmations
- Service role full access for backend operations

### Session Validation
- Session code must match
- Expiration checked automatically
- Payment status verified before confirmation

### File Uploads
- Screenshots stored with secure URLs
- Validation before storage
- Optional verification field

## Performance Optimization

### Indexes Created
- `idx_payment_sessions_customer_phone` - Fast customer lookup
- `idx_payment_sessions_status` - Filter by status
- `idx_payment_sessions_created_at` - Time-based queries
- `idx_payment_sessions_service_id` - Service-based reports
- `idx_payment_transactions_session_id` - Transaction audit
- `idx_help_faqs_category` - FAQ filtering

## Troubleshooting

### Session Not Found
- Check session code is correct (8 digits)
- Session may have expired (24h timeout)
- Verify in database: `SELECT * FROM payment_sessions WHERE session_code = '...'`

### USSD Code Issues
- Verify admin phone number is set
- Check payment network selection
- Test with Moov: `*555*2*24277123456*100#` (no actual charge)

### Screenshot Upload Fails
- Check file size < 10MB
- Verify image format (JPG, PNG)
- Check storage bucket permissions

### FAQ Not Showing
- Verify FAQ has `active = true`
- Check category matches filter
- Confirm created_by references valid admin

## Next Steps

1. **Request Database Access**: Run migrations in Supabase
2. **Set Admin Numbers**: Update payment config with real Moov/Airtel numbers
3. **Test Payments**: Use test USSD codes
4. **Integrate Components**: Add to your pages
5. **Configure FAQs**: Add custom questions for your salon
6. **Train Admins**: Show payment approval workflow
7. **Monitor Payments**: Check admin dashboard regularly

## Support

For issues or questions:
1. Check server logs: `docker logs salon-backend`
2. Verify Supabase tables exist: SELECT * FROM payment_sessions;
3. Check API connectivity: GET /api/payments/faqs
4. Review component props and expected data structure

---

**Created**: 2026-04-02
**Version**: 1.0
**Status**: Production Ready
