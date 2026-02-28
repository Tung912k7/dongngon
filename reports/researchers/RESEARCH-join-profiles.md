## Research Report: Join Profiles

### Executive Summary
Supabase provides seamless table joins via PostgREST. To retrieve `display_name` from the `profiles` table when querying `works`, we pass a nested select string: `author:profiles(display_name)`.

### Findings
#### Finding 1: Supabase Foreign Key Joins
Supabase automatically detects foreign key relationships. The user provided the exact syntax they want used:
\`\`\`javascript
supabase.from('works').select('*, author:profiles(display_name, birthday)')
\`\`\`
- Source: User Request
- Confidence: High

#### Finding 2: Realtime Payloads and Joins
Supabase Realtime payloads (`INSERT`, `UPDATE`) do not automatically execute joins. The payload only contains the raw row data from the mutated table (`works`). To get the `display_name` in realtime, the client must either fetch it separately upon receiving the payload, or the UI must degrade gracefully (e.g., using a fallback like "Người dùng"). Since `author_nickname` is still saved in the `works` table at creation time, we can use it as a fallback if `display_name` is not available in the payload.
- Confidence: High

### Recommendations
1. **Recommended**: Update `app/kho-tang/page.tsx`, `components/DongNgonClient.tsx`, `app/profile/page.tsx`, and `app/work/[id]/page.tsx` to include `author:profiles(display_name)` in the select query.
2. **Recommended**: Update mapping logic: `author_nickname: sanitizeNickname(work.author?.display_name || work.author_nickname || "Người bí ẩn")`.
