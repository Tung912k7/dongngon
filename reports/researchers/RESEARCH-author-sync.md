## Research: Data Synchronization in Supabase

### Patterns for Denormalized Sync
1. **Application Layer Sync (Prisma/ORM or Supabase Client)**
   - The server action runs two queries: `upsert` Profile, then `update` Contributions.
   - *Pros*: Easy to implement in TS.
   - *Cons*: Network latency causes a partial update risk if the second query fails. Not foolproof if the DB is updated via Dashboard or other interfaces.

2. **Database Triggers (PostgreSQL)**
   - Create a PL/pgSQL function triggered `AFTER UPDATE OF nickname ON profiles`.
   - *Pros*: 100% ACID compliant. Unbreakable consistency regardless of *how* the nickname is updated (Server action, admin dashboard, future mobile app).
   - *Cons*: Requires SQL migration script.

### Recommendation
Given the importance of long-term consistency and the usage of Supabase, **Database Triggers** are the superior approach here. We will write a `.sql` migration file that Supabase can apply, avoiding any extra network overhead in the Next.js server actions.
