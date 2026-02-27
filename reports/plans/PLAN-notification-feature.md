## Implementation Plan: Notification Feature

### 1. Database Migrations
- **File:** `supabase/migrations/20260228000000_create_notifications.sql`
- **Action:** Create `notifications` table containing `id`, `user_id` (uuid), `work_id` (uuid, optional), `type` ('contribution' or 'announcement'), `message` (text), `is_read` (boolean, default false), `created_at` (timestamptz).
- **RLS:** Allow `SELECT` and `UPDATE` where `user_id = auth.uid()`. Allow inserts from authenticated users (or maybe just keep it simple logic-level inserts relying on triggers/server actions).

### 2. Update Database Types
- **File:** `types/database.ts`
- **Action:** Insert `Notification` type corresponding to the table columns.

### 3. Build Notification Server Actions
- **File:** `actions/notification.ts`
- **Action:** Create Server Actions `getNotifications`, `markAsRead`, and `createAnnouncement`.
- `createAnnouncement` will fetch all `profiles` and bulk insert an announcement notification.

### 4. Create Notification Bell Component (Client)
- **File:** `components/NotificationBell.tsx`
- **Action:** 
  - Render a Bell SVG.
  - Fetch notifications on mount.
  - Show a small dropdown/popover with a list of the latest notifications.
  - Implement unread dot indicator indicator if `!is_read` counts > 0.
  - Display `message`, `type`, and `created_at`.
  - When a user clicks a notification, fire the `markAsRead` server action if unread.

### 5. Update Header
- **File:** `components/Header.tsx`
- **Action:** Import `<NotificationBell />` and place it adjacent to the User dropdown pill in both Desktop and Mobile navigation variants.

### 6. Hook into Contributions
- **File:** `actions/contribute.ts`
- **Action:** 
  - Add `created_by` and `title` to the `select("status, limit_type, sub_category, created_by, title")` query for the work.
  - At the end of `submitContribution`, check `if (work.created_by !== user.id)`. 
  - If true, insert into `notifications`: `type = 'contribution'`, `user_id = work.created_by`, `work_id = workId`, `message = "${nickname} đã đóng góp tiếp nối vào tác phẩm '${work.title}'."`.

### Checkpoints
- [ ] Database migration defined
- [ ] Type definitions added
- [ ] `actions/notification.ts` created
- [ ] `<NotificationBell>` component built
- [ ] `Header.tsx` updated to include Bell
- [ ] Contributions trigger notifications correctly
