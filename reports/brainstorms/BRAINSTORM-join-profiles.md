## Requirements Discovery: Join Profiles
        
### Initial Request
"Since your `works` table only stores `created_by` (a long ID code), you need to perform a join to get the display name from the `profiles` table."

### Problem Statement
The application currently fetches `author_nickname` directly from the `works` table. However, since the `works` table relies on `created_by` for attribution, any updates to a user's display name in their profile will not retroactively update their existing works. To ensure accurate and up-to-date attribution, the system must perform a relational join to the `profiles` table to retrieve `display_name`.

### Stakeholders
| Role | Needs | Priority |
|---|---|---|
| User | See accurate and current author names on works | High |

### Requirements
#### Functional
| ID | Requirement | Priority |
|---|---|---|
| FR1 | Modify queries retrieving works to join the `profiles` table via the `created_by` foreign key. | Must |
| FR2 | Use `author:profiles(display_name)` to alias the joined table. | Must |
| FR3 | Update the datamapping logic to use `work.author?.display_name` instead of `work.author_nickname`. | Must |

### Success Criteria
1. `app/kho-tang/page.tsx` and `components/DongNgonClient.tsx` accurately show the author's current display name from the profile.
2. The realtime subscription in `DongNgonClient.tsx` correctly handles or fetches the display name for new/updated works.
3. No build or type errors.
