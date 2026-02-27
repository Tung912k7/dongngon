## Requirements Discovery: Add Birthday & Age Restrictions

### Initial Request
"add data of birth to the sign in form" -> Clarified to: "Add it at sign up, not sign in. Database have birthday column. I want when user create works, they need to choose age restrictions, options will be all, 13+, 16+ and 18+."

### Problem Statement
The platform needs to collect the user's date of birth during registration. Furthermore, authors creating literature works must be able to specify an age restriction (All, 13+, 16+, 18+) for their works, likely to filter or restrict viewership later based on the reader's age.

### Stakeholders
| Role   | Needs   | Priority |
| ------ | ------- | -------- |
| User | Needs to enter their birthday during registration. Needs clear UI to select age ratings for works they create. | High |
| Reader | Will eventually need content filtered by their age (future feature, out of scope for *just* the upload form). | Medium |

### Requirements
#### Functional
| ID  | Requirement | Priority       |
| --- | ----------- | -------------- |
| FR1 | Add a "Birthday" or "Date of Birth" date input field to the `SignUpForm` component. | Must |
| FR2 | Map the birthday input to the Supabase authentication payload (likely in user metadata, then to `profiles.birthday`). | Must |
| FR3 | Add an "Age Restriction" dropdown/selector to the `CreateWorkModal` (and possibly `EditWorkModal`). | Must |
| FR4 | Allowed Age Restrictions: `all`, `13+`, `16+`, `18+`. | Must |
| FR5 | Ensure the `works` table in the database has a column for `age_restriction`, or create a migration for it. | Must |

### Success Criteria
1. New users can successfully sign up by providing their birthday, and it saves to the database.
2. Users can create a new work and select one of the four age restrictions, which saves successfully to the database.

### Open Questions
- Does the `works` table already have an `age_restriction` column? (Phase 3 will scout this).
- What does the Supabase `profiles` table schema currently look like for the `birthday` column? (Name, type - e.g., `date`?).
