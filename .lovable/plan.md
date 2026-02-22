

# Stripe Payment Gateway Integration

## Overview

Wire up Stripe as the payment gateway for AIKO's Free/Pro/Enterprise plans, with one-click card payments (Visa, Debit, Credit, Mastercard) via Stripe Checkout. This includes database schema for tracking subscriptions, a storage bucket for public assets, and full backend-to-frontend wiring.

## Pre-Requisite: Enable Stripe

Before any code is written, Stripe must be enabled on the project using the Stripe integration tool. This will prompt for the Stripe secret key and unlock Stripe-specific tools (product/price creation, checkout sessions, webhooks).

## Architecture

```text
User clicks "Start Free Trial" or "Subscribe"
        |
        v
Frontend calls edge function: create-checkout-session
        |
        v
Edge function creates Stripe Checkout Session
  - Sets price_id based on plan + interval
  - Sets success_url and cancel_url
  - Attaches customer metadata (user UUID)
        |
        v
User redirected to Stripe Checkout (hosted page)
  - Accepts Visa, Mastercard, Debit, Credit
  - One-click payment via saved cards (Stripe Link)
        |
        v
Stripe sends webhook to: stripe-webhook edge function
  - checkout.session.completed -> create subscription record
  - customer.subscription.updated -> update plan
  - customer.subscription.deleted -> downgrade to free
  - invoice.payment_failed -> mark payment failed
        |
        v
Database updated: subscriptions table + profiles.plan
```

## Part 1: Database Schema (Migration)

### New Table: `subscriptions`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | gen_random_uuid() |
| user_id | uuid (NOT NULL) | References profiles(id) |
| stripe_customer_id | text (NOT NULL) | Stripe customer ID |
| stripe_subscription_id | text | Nullable for one-time |
| stripe_price_id | text | Current price |
| plan | text (NOT NULL) | 'free', 'pro', 'enterprise' |
| status | text (NOT NULL) | 'active', 'canceled', 'past_due', 'trialing' |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | Default false |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

RLS Policies:
- Users can SELECT their own subscriptions
- No direct INSERT/UPDATE/DELETE from client (webhook handles mutations via service role)

### New Table: `payment_history`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid (NOT NULL) | |
| stripe_invoice_id | text | |
| amount_cents | integer | |
| currency | text | Default 'usd' |
| status | text | 'paid', 'failed', 'pending' |
| created_at | timestamptz | |

RLS: Users can SELECT own payment history only.

### Storage Bucket

Create a `public-assets` storage bucket with public read access for user avatars, project thumbnails, and platform assets.

## Part 2: Edge Functions

### `create-checkout-session` (NEW)

- Validates auth token
- Looks up or creates Stripe customer (by user UUID + email)
- Creates Stripe Checkout Session with:
  - `payment_method_types: ['card']` (covers Visa, Mastercard, Debit, Credit)
  - `mode: 'subscription'`
  - `allow_promotion_codes: true`
  - `success_url` and `cancel_url`
- Returns session URL to frontend

### `stripe-webhook` (NEW)

- Validates Stripe signature using webhook secret
- Handles events:
  - `checkout.session.completed` -- creates/updates subscription record, updates `profiles.plan`
  - `customer.subscription.updated` -- syncs plan status
  - `customer.subscription.deleted` -- reverts to free
  - `invoice.payment_failed` -- marks status as `past_due`
- Uses service role key for database writes (bypasses RLS)

### `create-customer-portal` (NEW)

- Creates Stripe Customer Portal session
- Allows users to manage billing, update cards, cancel subscriptions
- Returns portal URL

## Part 3: Frontend Changes

### Pricing Component (`src/components/Pricing.tsx`)

- Wire CTA buttons to call `create-checkout-session` edge function
- Free plan: navigates to `/auth` (signup)
- Pro plan: creates checkout session with monthly/annual price
- Enterprise plan: opens contact/sales form

### Settings Page (`src/pages/Settings.tsx`)

- Plan section shows current plan + status
- "Manage Billing" button calls `create-customer-portal`
- "Upgrade" button for free users
- Shows next billing date from subscription data

### New Hook: `src/hooks/useSubscription.ts`

- Fetches user's active subscription from `subscriptions` table
- Provides `plan`, `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`
- Used by Settings, Dashboard, and feature-gating logic

### New Route: `/checkout/success`

- Success page after Stripe checkout
- Polls subscription status until confirmed
- Redirects to dashboard

## Part 4: Stripe Product Setup

Using the Stripe tools (available after enabling):
- Create "AIKO Pro Monthly" product + price ($29/mo)
- Create "AIKO Pro Annual" product + price ($24/mo billed annually = $288/yr)
- Store price IDs in edge function config

## Part 5: UUID Verification

Every registered user already gets a proper UUID:
- `auth.users.id` is UUID (provided by auth system)
- `profiles.id` references `auth.users.id` (set by `handle_new_user` trigger)
- `user_roles.user_id` references `auth.users.id`
- All project/conversation/message tables use `user_id` UUID

No changes needed -- UUID assignment is already correct.

## Files Created/Modified

```text
supabase/functions/create-checkout-session/index.ts   [NEW]
supabase/functions/stripe-webhook/index.ts            [NEW]
supabase/functions/create-customer-portal/index.ts    [NEW]
src/hooks/useSubscription.ts                          [NEW]
src/pages/CheckoutSuccess.tsx                         [NEW]
src/components/Pricing.tsx                            [MODIFIED] - Wire CTAs
src/pages/Settings.tsx                                [MODIFIED] - Billing section
src/App.tsx                                           [MODIFIED] - Add /checkout/success route
supabase/config.toml                                  [AUTO-UPDATED] - New function configs
```

## Migration SQL (will be created via migration tool)

- `subscriptions` table with RLS
- `payment_history` table with RLS
- `public-assets` storage bucket
- Trigger to update `updated_at` on subscriptions

## Sequence of Implementation

1. Enable Stripe (collect secret key)
2. Run database migration (subscriptions + payment_history + storage)
3. Create edge functions (checkout, webhook, portal)
4. Create Stripe products/prices
5. Wire frontend (Pricing CTAs, Settings billing, success page)
6. Test end-to-end with Stripe test mode

## What This Does NOT Touch

- AIKO chat system / sub-agents
- PreviewPanel / Playground
- Auth flow (already working)
- Admin page
- Any existing RLS policies

