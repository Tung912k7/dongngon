## Requirements Discovery: Notification Feature

### Initial Request
"add notification feature to the website"

### Clarifying Questions & Answers
1. **Triggers:** New contribution on a user's work, and an admin makes an announcement.
2. **Location:** A dropdown bell icon in the navigation bar.
3. **States:** Read/unread states with a blue dot indicator.
4. **Email:** Strictly in-app, no email notifications.

### Problem Statement
The platform needs a real-time (or near real-time/polling-based) in-app notification system. Users need to be informed when their works receive new contributions, and when administrators broadcast global announcements. These notifications must be accessible via a bell icon in the navigation bar, supporting read/unread states without sending external emails.

### Stakeholders
| Role   | Needs   | Priority |
| ------ | ------- | -------- |
| User | Needs to know when someone contributes to their work or when admins announce something. | High |
| Admin | Needs a way to trigger/create an announcement notification for all users. | Medium |

### Requirements
#### Functional
| ID  | Requirement | Priority       |
| --- | ----------- | -------------- |
| FR1 | Create a `notifications` table in Supabase. | Must |
| FR2 | Schema: `id`, `user_id` (recipient), `actor_id` (who did it), `type` (contribution, announcement), `work_id` (if applicable), `message` (details), `is_read` (boolean), `created_at`. | Must |
| FR3 | Add a Bell Icon to the top Navigation Bar with an unread badge indicator. | Must |
| FR4 | Bell Icon opens a dropdown showing recent notifications. | Must |
| FR5 | Clicking a notification marks it as `is_read=true`. | Must |
| FR6 | Insert a notification row automatically when a new contribution is added to a work. | Must |
| FR7 | Create a mechanism for Admin announcements (e.g., broadcast notification). | Should |

### Success Criteria
1. When a user adds a contribution to "Work X", the owner of "Work X" sees their bell icon update with an unread badge.
2. The owner can click the bell, see the notification dropdown, click the notification to mark it read, which removes the unread state.
3. No emails are sent.

### Open Questions
- Admin announcements: How does an admin trigger an announcement? (Usually via a separate admin table or action, might require its own simple UI if it doesn't exist).
