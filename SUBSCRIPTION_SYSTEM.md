# Subscription System Documentation

## Overview

This application now features a comprehensive subscription system with **three tiers**: Free, Pro ($5/month), and Premium ($10/month). Payments are processed via UPI with automatic QR code generation in Indian Rupees.

## Subscription Plans

### 🆓 Free Plan
- **Cost**: Free forever
- **Features**:
  - AI dream analysis
  - Dream gallery & saving
  - Video duration: up to 5s
  - Basic support

### ⚡ Pro Plan
- **Cost**: $5 USD/month (₹415 INR)
- **Features**:
  - Everything in Free
  - Priority video generation
  - Video duration: up to 10s
  - HD thumbnails
  - Email support
  - No watermark

### 👑 Premium Plan (Most Popular)
- **Cost**: $10 USD/month (₹830 INR)
- **Features**:
  - Everything in Pro
  - Priority support 24/7
  - Video duration: up to 15s
  - Full HD quality (1080p)
  - Advanced analytics
  - Early access to features
  - Custom dream themes

## Payment Flow

### User Journey
1. **Select Plan**: User navigates to `/upgrade` or clicks "Upgrade" from subscription page
2. **View Plans**: Three plan cards displayed with Free, Pro, and Premium options
3. **Choose Plan**: Click "Upgrade Now" on desired plan
4. **Payment Screen**: 
   - Shows plan details with USD and INR pricing
   - Displays UPI QR code for exact INR amount
   - Provides UPI ID for manual payment
5. **Pay via UPI**: User scans QR with any UPI app (Google Pay, PhonePe, Paytm, etc.)
6. **Upload Screenshot**: User takes screenshot of successful payment and uploads
7. **Auto-Activation**: Plan activates automatically upon screenshot upload
8. **Confirmation**: User redirected to subscription page with active plan

### Payment Details
- **Currency Conversion**: USD to INR at rate of ₹83 per $1 (configurable)
- **QR Code**: Generated dynamically with exact amount
- **UPI ID**: `6361698728@slc` (configurable in code)
- **Merchant Name**: `DreamVision` (configurable)

## Technical Implementation

### Frontend Components

#### `/src/pages/Upgrade.jsx`
- Main upgrade/payment page
- Displays all three plans (Free, Pro, Premium)
- Shows current plan with visual indicators
- Generates UPI QR codes
- Handles screenshot upload
- Payment verification

**Key Features**:
- USD to INR conversion (83:1 ratio)
- QR code generation via `api.qrserver.com`
- Screenshot preview
- Back button to subscription page
- Current plan highlighting
- Disabled downgrade options (contact support)

#### `/src/components/UpgradePlan.jsx`
- Compact plan display for subscription page
- Shows Pro and Premium plans only
- Current plan badges
- "View All Plans & Options" button
- Responsive grid layout

#### `/src/pages/Subscription.jsx`
- Subscription management dashboard
- Current plan status
- Plan benefits comparison
- Upgrade options
- Back button

### Backend Endpoints

#### `POST /api/verify-upi-payment`
Verifies payment and activates subscription automatically.

**Request Body**:
```json
{
  "userId": "user-uuid",
  "plan": "pro",  // or "premium"
  "amount": 415,  // INR
  "amountUSD": 5,
  "upiId": "6361698728@slc",
  "screenshotName": "payment_screenshot.png",
  "timestamp": "2025-10-05T09:27:31.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment confirmed! Your PRO plan is now active.",
  "status": "active",
  "subscription": {
    "userId": "user-uuid",
    "plan": "pro",
    "amount_inr": 415,
    "amount_usd": 5,
    "status": "active",
    "startDate": "2025-10-05T09:27:31.000Z",
    "endDate": "2025-11-04T09:27:31.000Z",
    "videosLimit": 100,
    "videosUsed": 0,
    "autoRenew": true,
    "screenshotVerified": true,
    "paymentMethod": "UPI"
  }
}
```

#### `GET /api/subscription/:userId`
Retrieves current subscription status.

**Response**:
```json
{
  "userId": "user-uuid",
  "plan": "pro",
  "status": "active",
  "videosLimit": 100,
  "videosUsed": 5,
  "videosRemaining": 95,
  "endDate": "2025-11-04T09:27:31.000Z"
}
```

### Configuration

#### UPI Settings (in `Upgrade.jsx`)
```javascript
const UPI_ID = '6361698728@slc';  // Change to your UPI ID
const MERCHANT_NAME = 'DreamVision';  // Your business name
const USD_TO_INR = 83;  // Current conversion rate
```

#### Plan Pricing
Update the `plans` array in both `Upgrade.jsx` and `UpgradePlan.jsx`:
```javascript
{
  id: 'pro',
  name: 'Pro',
  priceUSD: 5,  // USD amount
  priceINR: 5 * USD_TO_INR,  // Auto-calculated
  // ... features
}
```

## Features Implemented

### ✅ Completed Features
- Three-tier subscription system (Free, Pro, Premium)
- Dynamic QR code generation based on plan
- USD to INR currency conversion
- UPI payment integration
- Screenshot upload for verification
- Automatic plan activation
- Current plan display with badges
- Back button navigation
- Change plan functionality
- Responsive design
- Plan comparison cards
- Trust badges (Secure UPI, Instant Activation, Cancel Anytime)

### 🔧 Production Recommendations

1. **Screenshot Verification**
   - Current: Auto-approves all uploads
   - Recommended: Implement OCR or manual admin verification
   - Consider: Integration with payment gateway API for automatic verification

2. **Database Integration**
   - Current: In-memory storage (Map)
   - Recommended: Store in Supabase `subscriptions` table
   - Add: Transaction history, invoice generation

3. **Payment Gateway**
   - Current: Manual UPI QR + screenshot
   - Optional: Integrate Razorpay for automated verification
   - Benefits: Automatic confirmation, webhooks, refunds

4. **Email Notifications**
   - Send confirmation email on plan activation
   - Reminder emails before plan expiration
   - Invoice/receipt generation

5. **Security**
   - Add rate limiting on payment endpoints
   - Implement CSRF protection
   - Add payment attempt logging
   - Monitor for fraudulent activity

## Usage Examples

### Upgrading to Pro Plan
```javascript
// User clicks "Upgrade to Pro"
navigate('/upgrade?plan=pro');

// System generates QR code
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(upiUrl)}`;

// After payment and screenshot upload
const response = await fetch('/api/verify-upi-payment', {
  method: 'POST',
  body: JSON.stringify({ userId, plan: 'pro', amount: 415, amountUSD: 5 })
});
// User's plan is now active!
```

### Checking Current Plan
```javascript
const subscription = await fetchActiveSubscription(userId);
console.log(subscription.plan); // "pro"
console.log(subscription.status); // "active"
```

## Navigation Flow

```
/subscription → View current plan & benefits
    ↓
    Click "View All Plans" or "Upgrade"
    ↓
/upgrade → See all plans (Free, Pro, Premium)
    ↓
    Click "Upgrade Now" on Pro/Premium
    ↓
/upgrade (Payment View) → QR code + Screenshot upload
    ↓
    Upload screenshot
    ↓
    Auto-activation
    ↓
/subscription → See activated plan
```

## Testing

### Manual Testing Steps
1. Navigate to `/subscription`
2. Click "View All Plans & Options"
3. Verify Free, Pro, and Premium plans are displayed
4. Check current plan badge is shown correctly
5. Click "Upgrade Now" on Pro plan
6. Verify QR code displays with ₹415 amount
7. Verify instructions show correct amount
8. Upload a test image as screenshot
9. Click "Confirm Payment & Activate Subscription"
10. Verify redirect to subscription page
11. Confirm plan shows as "PRO" and "Current Plan"

### Backend Testing
```bash
# Test payment verification
curl -X POST http://localhost:3001/api/verify-upi-payment \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "plan": "pro",
    "amount": 415,
    "amountUSD": 5,
    "upiId": "6361698728@slc",
    "screenshotName": "test.png"
  }'

# Check subscription status
curl http://localhost:3001/api/subscription/test-user-123
```

## Troubleshooting

### QR Code Not Generating
- Check internet connection (QR service is external)
- Verify UPI_ID and amount are correct
- Check browser console for errors

### Plan Not Activating
- Check backend console logs
- Verify backend is running on port 3001
- Ensure `VITE_BACKEND_URL` is set correctly
- Check network tab in browser dev tools

### Wrong Amount in QR Code
- Update `USD_TO_INR` constant in `Upgrade.jsx`
- Clear browser cache and refresh
- Verify plan `priceINR` calculation

## Future Enhancements

- Annual billing with discount
- Plan comparison toggle
- Promo codes/coupons
- Referral program
- Plan usage statistics
- Auto-renewal reminders
- Failed payment retry
- Grace period after expiry
- Plan downgrade with prorating
- Multiple payment methods (card, wallet)

---

**Last Updated**: October 5, 2025  
**Version**: 2.0
