## Requirements Discovery: Author Nickname Sync

### Initial Request
Thêm chức năng tự động đồng bộ tên người dùng (author_nickname) khi người dùng đổi tên trong Profile

### Clarifying Questions
1. Q: Why do we have `author_nickname` stored repeatedly instead of a JOIN?
   A: Based on past conversations, the user explicitly prefers using the caching/denormalized `author_nickname` column in the `contributions` table rather than resolving via expensive `PROFILES` joins on the frontend rendering logic.
2. Q: What exactly needs to happen?
   A: When a user calls the Next.js Server Action to update their profile's nickname, all existing records in `contributions` referencing their `user_id` should immediately have `author_nickname` updated to the new name.

### Problem Statement
Denormalized schema design requires explicit data synchronization logic. When `profiles.nickname` updates, `contributions.author_nickname` becomes stale.

### Stakeholders
| Role | Needs | Priority |
|---|---|---|
| User | Wants their updated name to reflect on old contributions | H |
| System | Keep database in sync without complex web queries | H |

### Requirements
#### Functional
| ID | Requirement | Priority |
|---|---|---|
| FR1 | Implement automated sync of `nickname` -> `author_nickname` | Must |
| FR2 | Make the sync unbreakable (trigger-based at the DB layer) | Must |

### Success Criteria
1. Modifying user nickname via `updateProfile()` instantly changes `author_nickname` on all of their contributions.
