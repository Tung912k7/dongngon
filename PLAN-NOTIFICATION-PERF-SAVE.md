# 📋 UPDATED IMPLEMENTATION PLAN: NOTIFICATIONS, PERFORMANCE, AND SAVED WORKS

## 1. 💖 FEATURE: SAVED WORKS (BOOKMARKS)
Allow users to "save" works they like.

### 🗄️ Database (Supabase)
- **Table:** `saved_works`
    - `id`: uuid (primary key)
    - `user_id`: uuid (references `profiles.id`)
    - `work_id`: uuid (references `works.id`)
    - `created_at`: timestamptz
    - *Unique constraint:* (`user_id`, `work_id`)

### 💻 Backend (Actions)
- `toggleSaveWork(workId: string)`: Adds/removes record.

### 🎨 Frontend (UI)
- **Icons:** Use **Heart icon** (`LucideHeart` or SVG) instead of Save icon.
- **Placements:**
    - `WorkPageLayout` / `ContributionSidebar`.
    - **Preview Work (DongNgonClient):** Add heart button to each work card in the `Kho Tang` view.
- **Account Page:** Show saved works list.

---

## 🔔 2. FEATURE: NOTIFICATION SYSTEM (ENHANCEMENT)
Leverage existing notification infrastructure to automate engagement.

### 🔍 Current State Analysis
- **Status:** Infrastructure exists (Table `notifications`, UI `/notification`, Actions `@/actions/notification`).
- **Functionality:** Currently handles admin reports and manual announcements.
- **Missing:** Automated storytelling triggers.

### ⚙️ Enhancement Logic (Database Triggers)
- **New Trigger 1 (Work Owner):** Notify work owner when a new contribution is added.
- **New Trigger 2 (Story Flow):** Notify the *previous contributor* in the sequence that someone has written the next part.
- **New Trigger 3 (Milestones):** Notify owner when work reaches 10, 50, 100 sentences.

---

## ⚡ 3. PERFORMANCE: INFINITE LOADING
Optimize `Feed.tsx` for very long works.

### 💻 Backend
- Implement `getContributionsChunk` with `limit` and `offset`.

### 🎨 Frontend
- Update `Virtuoso` in `Feed.tsx` to handle incremental fetching.
- Initial fetch: 50 items. Subsequent: 50 items on `endReached`.

---

## 📅 UPDATED ROADMAP

### Phase 1: Saves & Heart Icons
- [x] DB: Create `saved_works` table.
- [x] UI: Add **Heart** button to `Kho Tang` (Work Preview).
- [x] UI: Add **Heart** button to `WorkPage` sidebar.

### Phase 2: Performance
- [x] Refactor `WorkPage` server fetch to be limited.
- [x] Add `endReached` logic to `Feed.tsx`.

### Phase 3: Notification Triggers
- [x] Write SQL triggers to automate notifications based on `contributions` table activity.
- [x] Update Header UI to show unread count (if not already fully integrated).

---

## 🧪 VERIFICATION
- **Heart:** Clicking heart in `Kho Tang` saves work → heart fills.
- **Perf:** Work with 500+ sentences doesn't lag on load.
- **Notif:** I write a sentence → The previous writer gets a notification instantly.
