# Implementation Plan: Join Profiles

## Goal Description
The `works` table is queried across the frontend, heavily relying on the hardcoded `author_nickname` column which can become stale if a user updates their profile. The user requested performing a relational join on `works.created_by = profiles.id` to get the actual `display_name` (and `nickname`). 

## Proposed Changes
### Frontend Database Queries
- **[MODIFY] [app/kho-tang/page.tsx](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/app/kho-tang/page.tsx)**
  - Update the Supabase `select` query string: `.select("... author:profiles(display_name, nickname)")`
  - Update `mappedWorks` logic: `author_nickname: sanitizeNickname(work.author?.display_name || work.author?.nickname || work.author_nickname || "Người bí ẩn")`

- **[MODIFY] [components/DongNgonClient.tsx](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/components/DongNgonClient.tsx)**
  - Update `fetchWorks`: `.select("... author:profiles(display_name, nickname)")`
  - Update `fetchWorks` mapping logic to use `work.author?.display_name`.
  - Update the realtime `payload` mapping to fallback gracefully to `payload.new.author_nickname` since realtime payloads do not include joins by default.

- **[MODIFY] [app/profile/page.tsx](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/app/profile/page.tsx)**
  - Update `createdWorks` query: `.select("*, author:profiles(display_name, nickname)")`
  - Update `contributions` query: `.select("*, works(*, author:profiles(display_name, nickname))")`

- **[MODIFY] [app/work/[id]/page.tsx](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/app/work/[id]/page.tsx)**
  - Update the specific work fetch to include `author:profiles(display_name, nickname)` in the `.select()` fields.

## Verification Plan

### Manual Verification
1. Verify the frontend compiles successfully via `npm run dev`.
2. Inspect the `/kho-tang` page and check if works load without errors and correctly display author names.
3. Access `/profile` and an individual work `/work/[id]` to ensure the author name appears appropriately.
