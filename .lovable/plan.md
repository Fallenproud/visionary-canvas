

# Final Polish: Admin in Profile Menu + Payment Gateway Staging

## Summary

Three tasks to wrap up before deployment:
1. Wire the Admin Panel link into the profile dropdown (Navigation + Dashboard) -- shown only to admin-role users
2. Create a mock payment gateway staging so the Pricing page CTA buttons trigger a checkout flow (mock mode, no real charges)
3. Ensure all files are consistent with new features

---

## 1. Admin Panel in Profile Menu

### Problem
The admin panel at `/admin` exists but is only reachable by manually typing the URL. Admin users should see an "Admin Panel" link in their profile dropdown menu (both desktop and mobile).

### Approach
- Create a small `useIsAdmin` hook that caches the `has_role` RPC result via React Query (avoids duplicating the inline `useEffect` pattern from `Admin.tsx`)
- In `Navigation.tsx`: import `useIsAdmin`, and conditionally render an "Admin Panel" menu item (with Shield icon) in the avatar dropdown and mobile menu -- only visible when `isAdmin === true`
- In `Dashboard.tsx`: add an "Admin" icon button in the top nav bar (next to Settings/Sign Out), also gated behind `useIsAdmin`

### Files
- **CREATE** `src/hooks/useIsAdmin.ts` -- small hook using React Query + `has_role` RPC
- **MODIFY** `src/components/Navigation.tsx` -- add Admin Panel item in dropdown + mobile menu
- **MODIFY** `src/pages/Dashboard.tsx` -- add Admin button in top nav

---

## 2. Payment Gateway Staging (Mock Checkout)

### Problem
Pricing page CTA buttons ("Get Started", "Start Free Trial", "Contact Sales") do nothing. We need a working checkout flow staged for testing before wiring real Stripe.

### Approach
Build a **mock checkout dialog** that simulates the payment flow:
- Clicking a pricing CTA opens a checkout dialog showing the plan name, price, and a mock card form
- The form validates card number format (any 16 digits), expiry (MM/YY), CVC (3 digits)
- On "Pay Now", it simulates a 2-second processing delay, then shows success
- On success, updates the user's `profiles.plan` to the selected plan in the database
- If user is not logged in, redirects to `/auth` first
- All clearly labeled as "Test Mode" with a badge so there's no confusion

### Files
- **CREATE** `src/components/MockCheckoutDialog.tsx` -- the checkout dialog component with mock card form
- **MODIFY** `src/components/Pricing.tsx` -- wire CTA buttons to open checkout dialog, pass plan details
- **MODIFY** `src/pages/Settings.tsx` -- show "Manage Plan" button that links to pricing section (since plan can now change)

---

## 3. Cross-File Consistency Updates

### Navigation.tsx
- Add `Shield` icon import
- Add `useIsAdmin` hook usage
- Add "Admin Panel" `DropdownMenuItem` between "Settings" and "Sign Out" separator (desktop)
- Add "Admin Panel" mobile menu item between "Settings" and "Sign Out"

### Dashboard.tsx
- Add `Shield` icon import
- Add `useIsAdmin` hook usage
- Add admin button in top nav (conditional on `isAdmin`)

### Pricing.tsx
- Import `useAuth` and `useNavigate`
- Import `MockCheckoutDialog`
- Add state for selected plan + dialog open
- Wire each CTA button: if not logged in, navigate to `/auth`; if logged in, open checkout dialog

### Settings.tsx
- Add a "Change Plan" button under the Plan section that scrolls/navigates to `/#pricing`

---

## Technical Details

### `useIsAdmin` Hook
```text
- Uses React Query with key ["is-admin", user?.id]
- Calls supabase.rpc("has_role", { _user_id, _role: "admin" })
- Returns { isAdmin: boolean, isLoading: boolean }
- Enabled only when user exists
- Stale time: 5 minutes (admin status rarely changes)
```

### MockCheckoutDialog Props
```text
{
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  price: string
  period: string
}
```

### MockCheckoutDialog Behavior
- Card number: accepts any 16 digits, formats as groups of 4
- Expiry: MM/YY format validation
- CVC: 3 digits
- "Pay Now" button shows spinner for 2s, then:
  - Updates profiles.plan via supabase client
  - Shows success toast
  - Closes dialog
- "Test Mode" badge at top of dialog
- No real payment processing

### Files Summary

| File | Action |
|------|--------|
| `src/hooks/useIsAdmin.ts` | CREATE |
| `src/components/MockCheckoutDialog.tsx` | CREATE |
| `src/components/Navigation.tsx` | MODIFY |
| `src/pages/Dashboard.tsx` | MODIFY |
| `src/components/Pricing.tsx` | MODIFY |
| `src/pages/Settings.tsx` | MODIFY |

### No Backend Changes Needed
- `profiles.plan` column already exists (free/pro/enterprise)
- No new edge functions required
- No database migrations needed
- No new packages needed -- uses existing Dialog, Input, Button, Badge components

