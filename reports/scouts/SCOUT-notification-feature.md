## Codebase Analysis: Notification Feature

### 1. Database Schema
- File `types/database.ts`. Need to add `Notification` type.
- Fields: `id`, `user_id`, `actor_name` (or `actor_id`), `type` (e.g. 'contribution', 'system', 'announcement'), `work_id` (optional), `message`, `is_read`, `created_at`.
- Let's create a Supabase migration file `supabase/migrations/20260228000000_create_notifications.sql` to define the table and set up trigger/RLS.

### 2. Header Component (components/Header.tsx)
- This is where the Bell Icon goes.
- It already has a user dropdown section: `user ? setIsDropdownOpen(...)`. We can place the bell icon slightly to the left of the user pill `nickname || "Tài khoản"`.
- Needs real-time or initial fetch logic to load `notifications` where `user_id = current user`. 
- Can create a dedicated client hook or component `<NotificationBell user={user} />` to keep `Header.tsx` cleaner, but the bell itself is simple.

### 3. Contribution Action (actions/contribute.ts)
- `submitContribution` fetches `work` to check status. We need to add `created_by` and `title` to the `select("status, limit_type, sub_category, created_by, title")` query.
- After successfully inserting the contribution, if `work.created_by !== user.id`, insert a row into `notifications`.
- `message`: `"{actor_nickname} đã đóng góp vào tác phẩm '{title}' của bạn."` 

### 4. Admin Announcement (actions/notification.ts)
- Need to create a new action file `actions/notification.ts`.
- Functions: `getNotifications()`, `markAsRead(id)`, `markAllAsRead()`, `createAdminAnnouncement(message)`.
- The admin announcements might be inserted with `user_id` as either `NULL` (broadcast) or we can just iterate over all users in the `profiles` table to bulk insert. Iterating is easiest for a small app. Better yet, just insert where `type = 'announcement'` and `user_id = NULL`? If `user_id` is null, it's global. When a user fetches notifications, they get `user_id = their_id` OR `user_id IS NULL`. To track read states for global announcements, users might need a junction table. Let's keep it simple: bulk insert individual notifications to all users, or just add a standard broadcast message. Let's just bulk insert into the `notifications` table for simplicity since it satisfies FR7.

### Summary
All integration points identified. The plan will break down these exactly.
