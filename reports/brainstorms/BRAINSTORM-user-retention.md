## Requirements Discovery: User Retention Mechanism

### Initial Request
"thiết kế cơ chế để giữ chân người dùng" (Design a mechanism to retain users)

### Clarifying Questions
1. Q: What is the nature of the application?
   A: "Đồng ngôn" is a slow-consumption, anti-doomscrolling sanctuary for literature. Contributions are strictly limited (1 char/line per day). 
2. Q: How does user retention traditionally conflict with this?
   A: Traditional retention relies on dopamine hits (likes, infinite scrolling, FOMO). This violates the core philosophy of Đồng ngôn.
3. Q: What kind of retention mechanism fits this philosophy?
   A: Mechanisms that reward consistency, deliberation, and emotional investment without inducing anxiety. Examples: gentle streaks (e.g., maintaining a "writing habit"), notification of collective progress (e.g., "The poem you contributed to has a new line"), or aesthetic rewards (e.g., unlocking new traditional Vietnamese fonts or themes after N days of reading).

### Problem Statement
The platform needs to encourage users to return daily or regularly to read and contribute, but it must do so without using modern deceptive UX patterns (like red notification badges or infinite feeds). The retention mechanism must align with the "slow consumption" and "cultural preservation" ethos of the site.

### Stakeholders
| Role   | Needs   | Priority |
| ------ | ------- | -------- |
| Users / Writers | Gentle nudges to return, feeling of peaceful progress | High |
| Platform Admin | Steady daily active users (DAU) | High |

### Requirements
#### Functional
| ID  | Requirement | Priority       |
| --- | ----------- | -------------- |
| FR1 | The mechanism must trigger a daily or periodic reason to return. | Must |
| FR2 | The mechanism must NOT use anxiety-inducing UX (no red dots, no aggressive popups). | Must |
| FR3 | The mechanism should integrate with the existing database (Supabase) and auth system. | Must |

### Success Criteria
1. Increase in Daily Active Users (DAU) measurable via PostHog.
2. Users achieve multi-day return habits without explicit gamification complaints.
3. The aesthetic tranquility of the site is maintained.

### Open Questions
- Should we focus on a "Daily Reading/Writing Streak" system, or an "Asynchronous Collaborative Notification" system? Both fit well, but one may be easier to implement first.
