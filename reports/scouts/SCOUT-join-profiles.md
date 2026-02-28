# Scout Report: Join Profiles

## Exploration Scope
- Target: Supabase queries fetching from the `works` table.
- Boundaries: Full codebase, specifically `/app` and `/components`.

## Patterns Discovered
### Pattern: Works Querying
- **Location**: 
  - `app/kho-tang/page.tsx`
  - `components/DongNgonClient.tsx`
  - `app/profile/page.tsx`
  - `app/work/[id]/page.tsx`
  - `components/popular/PopularContent.tsx`
- **Usage**: Hardcoded strings like `.select("id, title, ... author_nickname")`
- **Must Follow**: Yes, must be updated to `.select("id, title, ... author:profiles(display_name)")`

## Integration Points
| Point | File | Function | New Code Location |
|---|---|---|---|
| works query | `app/kho-tang/page.tsx` | `DongNgonPage` | `.select(...)` |
| works query | `components/DongNgonClient.tsx` | `fetchWorks` | `.select(...)` |
| realtime | `components/DongNgonClient.tsx` | `useEffect` | payload mapping |
| works query | `app/profile/page.tsx` | `ProfilePage` | `.select(...)` |
| works query | `app/work/[id]/page.tsx` | `WorkPage` | `.select(...)` |

## Warnings
- ⚠️ Realtime inserts in `DongNgonClient.tsx` will surface a `newWork` without the `author` join. We need to handle `newWork.author?.display_name || newWork.author_nickname`.
