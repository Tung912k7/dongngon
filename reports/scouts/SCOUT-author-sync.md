## Codebase Scout: Profile & Contribution Schema

### Relevant Tables & Columns
1. `profiles`: contains `id` (uuid) and `nickname` (text).
2. `contributions`: contains `id` (uuid), `user_id` (uuid, fk to profiles), and `author_nickname` (text).

### Relevant Application Logic
- `actions/profile.ts` handles the updating of `nickname` via `updateProfile()`.
- The frontend calls this action directly.

### Integration Points
- To use a PostgreSQL Trigger, we just need to place a raw `.sql` file in `supabase/migrations/` and apply it to the database. Alternatively, the user can paste the trigger in the Supabase SQL UI.
- The TS codebase requires no changes since the sync pushes data at the PostgreSQL engine level automatically.
