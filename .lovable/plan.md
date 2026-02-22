

# Admin Panel -- Full System Control Center

## Overview

Replace the current minimal Admin page (2 stat cards) with a comprehensive, tab-based admin control panel. All changes are scoped exclusively to `/admin` -- new files live under `src/components/admin/` and `src/pages/Admin.tsx` is rewritten. No other pages, routes, or components are touched.

## Architecture

### Backend: New Edge Function

**`supabase/functions/admin-stats/index.ts`** -- A single secure endpoint that aggregates all admin data server-side using service role (bypasses RLS). Returns:

- User stats: total, signups last 7/30 days, plan distribution, role counts
- Project stats: total, by status, by framework, created last 7/30 days
- Conversation/message stats: totals, messages last 7 days
- Storage: bucket info
- Recent signups: last 10 users (id, email, display_name, plan, created_at)
- Recent projects: last 10 (id, name, status, framework, created_at, user display_name)

Auth: validates Bearer token, then checks `has_role(user_id, 'admin')` via service role. Returns 403 if not admin.

### Backend: Role Management Edge Function

**`supabase/functions/admin-manage-role/index.ts`** -- Secure endpoint for admins to assign/remove roles:

- POST `{ action: "assign" | "revoke", user_id, role }` 
- Validates admin auth, prevents self-demotion
- Uses service role for user_roles mutations

### Backend: User Lookup Edge Function

**`supabase/functions/admin-users/index.ts`** -- Paginated user list with search:

- GET `?search=&page=&limit=`
- Returns profiles + roles joined, sorted by created_at desc
- Service role for cross-user reads

### No Database Changes Needed

All tables already exist with proper RLS. The edge functions use service role to bypass RLS for admin operations. The `has_role` function and `user_roles` table with `app_role` enum (admin/moderator/user) are already in place.

## Frontend: Tab-Based Layout

### Admin Page Structure

```text
+------------------------------------------------------+
| [Back] Admin Panel                                    |
+------------------------------------------------------+
| [Overview] [Users] [Projects] [System]                |
+------------------------------------------------------+
|                                                       |
|   (Tab content area)                                  |
|                                                       |
+------------------------------------------------------+
```

### Tab 1: Overview

KPI cards in a responsive grid:

| Card | Data Source |
|------|-----------|
| Total Users | admin-stats |
| Total Projects | admin-stats |
| Total Conversations | admin-stats |
| Total Messages | admin-stats |
| New Users (7d) | admin-stats |
| New Projects (7d) | admin-stats |

Below the KPIs:
- **Plan Distribution** -- small bar/list showing Free vs Pro vs Enterprise user counts
- **Project Status Breakdown** -- counts by draft/building/ready/archived
- **Recent Activity** -- last 5 signups + last 5 projects in a compact list

### Tab 2: Users

- Searchable, paginated user table
- Columns: Display Name, Email (from auth metadata in edge fn), Plan, Role, Joined
- Row actions: Change Role (dropdown: user/moderator/admin), View profile
- Role changes call `admin-manage-role` edge function
- Safeguard: cannot revoke own admin role

### Tab 3: Projects

- Paginated project table from admin-stats
- Columns: Name, Owner, Status, Framework, Created, Updated
- Read-only view (admins observe, don't modify user projects)

### Tab 4: System

- **API Health Check**: calls the `aiko-chat` edge function with a lightweight ping (OPTIONS request) and displays response time + status
- **Edge Functions Status**: list of deployed functions with last-known status
- **Storage**: bucket name, public/private status
- **Platform Config**: display-only summary of auth providers enabled (Google, Apple, GitHub), plan tiers offered
- **Database Stats**: table row counts from admin-stats

## Files Created

```text
src/components/admin/AdminOverview.tsx     -- KPI cards + distributions + recent activity
src/components/admin/AdminUsers.tsx        -- User table + role management
src/components/admin/AdminProjects.tsx     -- Projects table (read-only)
src/components/admin/AdminSystem.tsx       -- Health checks + system info
src/hooks/useAdminStats.ts                 -- React Query hook for admin-stats edge fn
src/hooks/useAdminUsers.ts                 -- React Query hook for admin-users edge fn
supabase/functions/admin-stats/index.ts    -- Aggregated stats endpoint
supabase/functions/admin-manage-role/index.ts -- Role assignment endpoint
supabase/functions/admin-users/index.ts    -- Paginated user list endpoint
```

## Files Modified

```text
src/pages/Admin.tsx                        -- Rewritten with tabs layout
```

## Technical Details

### Edge Function: admin-stats

```text
GET /admin-stats
Authorization: Bearer <user_jwt>

Response:
{
  users: { total, last7d, last30d, byPlan: { free, pro, enterprise } },
  roles: { admin, moderator, user },
  projects: { total, last7d, last30d, byStatus: {...}, byFramework: {...} },
  conversations: { total },
  messages: { total, last7d },
  recentUsers: [...],
  recentProjects: [...],
  storage: { buckets: [...] }
}
```

Authentication flow:
1. Extract JWT from Authorization header
2. Call `supabase.auth.getUser(token)` with service role client
3. Call `has_role(user.id, 'admin')` via RPC
4. If not admin, return 403
5. Run aggregation queries and return JSON

### Edge Function: admin-users

```text
GET /admin-users?search=john&page=1&limit=20
Authorization: Bearer <user_jwt>

Response:
{
  users: [{ id, display_name, email, plan, roles: ["user"], created_at }],
  total: 42,
  page: 1,
  totalPages: 3
}
```

Email is fetched from `auth.users` table via service role (not exposed to client).

### Edge Function: admin-manage-role

```text
POST /admin-manage-role
Authorization: Bearer <user_jwt>
Body: { "action": "assign", "user_id": "uuid", "role": "moderator" }

Response: { success: true }
```

Validations:
- Cannot assign/revoke to self
- Role must be valid enum value
- For "assign": upserts into user_roles
- For "revoke": deletes from user_roles (prevents removing last admin -- checks count first)

### Admin Page Component

- Uses existing `Tabs` component from `@/components/ui/tabs`
- Each tab is a separate component for code splitting
- All data fetched via React Query with 30s stale time
- Loading states use existing skeleton/spinner patterns
- Error states show toast notifications
- Responsive: cards stack on mobile, tables become scrollable

### User Table Component

- Uses existing `Table` component from `@/components/ui/table`
- Role change via `Select` dropdown per row
- Confirmation dialog before role changes
- Search input with debounce (300ms)
- Pagination with Previous/Next buttons

### System Health Component

- Pings edge functions on mount and shows latency
- Displays: function name, status (green/red dot), response time
- Manual "Refresh" button to re-check
- Storage info displayed as read-only cards
- No mock data -- everything is live from the backend

## Security Considerations

- All three edge functions validate admin role server-side
- Service role key never exposed to client
- Self-demotion prevention on role management
- Last-admin protection (cannot revoke if only 1 admin exists)
- All user emails fetched server-side only (not via client SDK)

## What This Does NOT Touch

- Landing page, Navigation, Hero, Pricing, Footer
- Auth flow, Dashboard, Playground, Settings
- Any existing RLS policies
- Any existing edge functions
- Database schema (no migrations needed)

