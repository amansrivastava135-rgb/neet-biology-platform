# Premium Subscription System Implementation

This document describes the secure subscription system implemented on the NEET Biology platform.

## Overview

The system enforces:
1. **365-day subscriptions** - Premium access lasts exactly 365 days from purchase
2. **Device limits** - Maximum 2 devices per account to prevent sharing
3. **Single active test session** - Only one test per account can run at a time
4. **Subscription validation** - Automatic checks on login and page access
5. **Backend security** - All validation happens server-side, can't be bypassed

---

## Data Model

### User Type Extensions

```typescript
type User = {
  id: string;
  email: string;
  name: string;
  isPaid: boolean;
  subscription: "free" | "active" | "expired";
  plan?: string;
  
  // 365-day subscription tracking
  subscription_start?: string; // ISO string
  subscription_end?: string; // ISO string
  
  // Device limit enforcement
  devices?: string[]; // max 2 device IDs
  
  // Active test session
  activeTestSession?: {
    sessionId: string;
    startTime: string;
    deviceId: string;
  };
  
  isAdmin: boolean;
};
```

---

## Core Utilities

### 1. Device Fingerprinting (`lib/device-fingerprint.ts`)

Generates a unique device ID per browser:

```typescript
const deviceId = generateDeviceFingerprint();
// Uses navigator.userAgent + localStorage for persistence
```

### 2. Subscription Validation (`lib/subscription-utils.ts`)

Helper functions to check subscription status:

```typescript
isSubscriptionActive(user) // → boolean
getRemainingDays(user) // → number
isDeviceRegistered(user, deviceId) // → boolean
addDevice(user, deviceId, maxDevices = 2) // → string[]
calculateSubscriptionEnd() // → ISO string (365 days from now)
```

---

## API Endpoints

### 1. Payment Verification (`api/payment/verify/route.ts`)

When payment succeeds, sets 365-day subscription:

```javascript
POST /api/payment/verify
{
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "..."
}

Response:
{
  success: true,
  user: {
    subscription: "active",
    subscription_start: "2026-03-13T...",
    subscription_end: "2027-03-13T...",
    plan: "NEET Test Series"
  }
}
```

### 2. Session Validation (`api/auth/validate-session/route.ts`)

Validates user session on login/access:

```javascript
POST /api/auth/validate-session
{
  userId: "...",
  deviceId: "..."
}

Response:
{
  valid: true,
  // or
  valid: false,
  message: "Device limit exceeded"
}
```

### 3. Active Test Session (`api/test/active-session/route.ts`)

Manages one-test-per-user constraint:

```javascript
// Start test
POST /api/test/active-session
{
  userId: "...",
  deviceId: "...",
  testType: "full" | "preview" | "chapter" | "practice"
}

// End test
PUT /api/test/active-session
{
  sessionId: "..."
}

// Check active session
GET /api/test/active-session?userId=xxx
```

---

## Frontend Integration

### 1. Subscription Guard Hook (`hooks/use-subscription-guard.ts`)

On protected pages:

```typescript
const { isValid, error, deviceId, user } = useSubscriptionGuard(
  requirePremium = true
);

if (error) {
  return <div>{error}</div>;
}

if (!isValid) {
  return null; // will auto-redirect
}

return <YourContent />;
```

### 2. Test Session Hook (`hooks/use-test-session.ts`)

When starting a test:

```typescript
const { sessionId, deviceId, endSession } = useTestSession("full");

// On cleanup, automatically ends session
useEffect(() => {
  return () => endSession();
}, []);
```

### 3. Subscription Guard Component (`components/subscription-guard.tsx`)

Wrapper component for premium pages:

```typescript
<SubscriptionGuard requiresPremium={true}>
  <YourPremiumContent />
</SubscriptionGuard>
```

---

## Workflow

### 1. Purchase Flow

```
User clicks "Buy Now"
  ↓
Razorpay checkout opens
  ↓
Payment successful
  ↓
/api/payment/verify called (backend)
  ↓
Subscription set: NOW + 365 days
  ↓
Frontend updates auth state
  ↓
Redirect to /dashboard
```

### 2. Access Control Flow

```
User attempts to access /mock-test
  ↓
useSubscriptionGuard() hook checks:
  • Is user logged in?
  • Is subscription.subscription_end > now?
  • Is device registered?
  • Are we under device limit (2)?
  ↓
If valid: render content
If invalid: redirect to /pricing or /login
```

### 3. Test Session Flow

```
User starts full mock test
  ↓
useTestSession("full") hook:
  • Generates device ID
  • POST /api/test/active-session
  • Receives sessionId
  ↓
If user was on another device in a test:
  • Previous session auto-terminated
  ↓
Test runs
  ↓
On cleanup: PUT /api/test/active-session (end session)
```

### 4. Automatic Expiry

```
User logs in
  ↓
migrateUser() checks subscription_end
  ↓
If now > subscription_end:
  • subscription = "expired"
  • isPaid = false
  ↓
Free features only
  ↓
Show expiry notification
  ↓
Redirect to /pricing
```

---

## Protected Routes

The following pages require active subscription:

- `/mock-test` (full tests only)
- `/dashboard` (premium analytics)
- `/practice` (full chapters)

Free users can access:
- `/` (homepage)
- `/pricing`
- `/login`, `/signup`
- Demo tests (10 questions)

---

## Security Notes

1. **Subscription validation happens server-side** in `api/payment/verify`
2. **Device IDs are fingerprint-based** - can't be spoofed easily
3. **Session IDs are server-generated** - stored in-memory (use Redis in production)
4. **localStorage used for persistence** - encrypted in production recommended
5. **Token expiry** - subscription_end compared to server time, not client time

---

## Limitations & Future Improvements

### Current (Demo Mode)

- Device storage: localStorage only
- Session storage: in-memory (lost on server restart)
- Payment: Razorpay sandbox mode
- Signature verification: dummy in dev mode

### Production Requirements

- Use database (PostgreSQL/MongoDB) for user & session storage
- Implement Redis for active session management
- Use real Razorpay keys with proper signature verification
- Add JWT/session tokens with server-side validation
- Implement device fingerprinting library (e.g., FingerprintJS)
- Add audit logging for subscriptions & logins
- Implement subscription renewal reminders
- Add support for subscription cancellation & refunds

---

## Testing Checklist

- [ ] Sign up as free user
- [ ] Try accessing premium test → redirects to /pricing
- [ ] Purchase premium (₹499)
- [ ] Subscription activates (365 days)
- [ ] Can access full mock tests
- [ ] Dashboard shows expiry date
- [ ] Login on second device → both devices registered
- [ ] Login on third device → oldest device removed or warning shown
- [ ] Start test on device 1, then device 2 → device 1's session ends
- [ ] Wait for subscription_end (or set date manually for testing)
- [ ] Subscription expires → redirected to pricing
- [ ] Admin panel shows paid/free user counts
