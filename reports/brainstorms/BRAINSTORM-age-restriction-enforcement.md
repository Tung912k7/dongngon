## Requirements Discovery: Age Restriction Enforcement

### Initial Request
Enable age restrictions for works based on user's birthday.
1. **Guests:** Can see all works (cards) including all, 13+, 16+, 18+, but can only "view" (I am interpreting this as: they can see the cards, but if they click a restricted work, they must log in to prove age).
2. **Access Policy (Option B):** Restricted works still appear on the feed/search (work cards). If an underage user matches the restriction, they are blocked on the work page with a "Bạn chưa đủ tuổi để xem tác phẩm này" message.
3. **UI Tags:** Show a small badge/tag (e.g., 18+, 16+) on the `WorkCard` so users know the restriction.
4. **Enforcement:** Users can only view the content and contribute to works they are old enough for.

### Functional Requirements
1. **Age Calculation:** Create a utility function to calculate a user's age from their `birthday` in the `profiles` table.
2. **WorkCard UI:** Update `WorkCard.tsx` to display a styled badge for `13+`, `16+`, and `18+` works. 
3. **View Gate (Page Level):** In `app/work/[id]/page.tsx` (or the equivalent work detail page):
   - If work is 'all', allow viewing.
   - If work is restricted (e.g. '18+'):
     - If not logged in -> Show block screen: "Vui lòng đăng nhập để xác nhận độ tuổi" (Please login to verify age).
     - If logged in -> Calculate age. If underage -> Show block screen: "Bạn chưa đủ tuổi để xem tác phẩm này" (You are not old enough).
     - If old enough -> Show normal work content.
4. **Contribution Gate (Action Level):** Update `actions/contribute.ts` to fetch the user's birthday, calculate age, and return an error if they attempt to submit to a work they are underage for.

### Success Criteria
- Underage users clicking an 18+ work see a blocked state and cannot read it.
- Guests clicking restricted works are prompted to log in.
- Allowed users can view and contribute normally.
- Work Cards prominently display the required age.
