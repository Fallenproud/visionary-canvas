
# Auth-Aware Navigation and Landing Page Polish

## Problem
The Navigation bar always shows "Sign In" and "Get Started" buttons regardless of login state. The Hero section CTA also always points to `/auth`. Logged-in users see sign-in prompts everywhere instead of their profile and a path to the dashboard.

## Changes

### 1. Navigation Component (`src/components/Navigation.tsx`)
- Import `useAuth` to check login state
- **When logged out**: Show "Sign In" + "Get Started" buttons (current behavior)
- **When logged in**: Replace those buttons with:
  - "Dashboard" button (navigates to `/dashboard`)
  - User avatar dropdown (initials from email/display name) with menu items: Dashboard, Settings, Sign Out
- Mobile menu: same logic -- show Dashboard + Sign Out links instead of "Get Started"

### 2. Hero Component (`src/components/Hero.tsx`)
- Import `useAuth`
- **When logged out**: "Get Started" button goes to `/auth` (current behavior)
- **When logged in**: "Get Started" changes to "Go to Dashboard" and navigates to `/dashboard`

### 3. Auth Page (`src/pages/Auth.tsx`)
- Already redirects logged-in users to `/dashboard` (line 55-58) -- no change needed

### 4. About Page (`src/pages/About.tsx`)
- Uses `<Navigation />` -- automatically benefits from the Navigation changes, no direct edits needed

## Technical Details

### Navigation logged-in state (desktop)
```text
[AIKO logo]  Features  Pricing  About  Contact    [Dashboard]  [Avatar dropdown]
```

Avatar dropdown contents:
- User email (display only, muted)
- Dashboard
- Settings
- Separator
- Sign Out

### Navigation logged-in state (mobile)
```text
Features
Pricing
About
Contact
---
Dashboard
Settings
Sign Out
```

### Files Modified
```text
src/components/Navigation.tsx   [MODIFIED] - Add auth-aware buttons + avatar dropdown
src/components/Hero.tsx          [MODIFIED] - Swap CTA text/action for logged-in users
```

### Dependencies
- Uses existing `useAuth` hook from `@/contexts/AuthContext`
- Uses existing `DropdownMenu` from `@/components/ui/dropdown-menu`
- Uses existing `Avatar` from `@/components/ui/avatar`
- No new packages needed
