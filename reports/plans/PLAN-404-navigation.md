# Fix Plan: 404 Error on Back Navigation

## Goal Description
The goal is to fix a 404 error that occurs when users press the "Quay lại" (Back) button on the work reading page. The root cause is that several `Link` components and `revalidatePath` calls are hardcoded to point to `/dong-ngon`, which is a non-existent route. The correct main feed route is `/kho-tang`.

## Proposed Changes
1. **app/work/[id]/page.tsx**: Replace all instances of `href="/dong-ngon"` with `href="/kho-tang"`.
2. **app/profile/page.tsx**: Replace any instances of `href="/dong-ngon"` with `href="/kho-tang"`.
3. **actions/work.ts**: Replace `revalidatePath("/dong-ngon")` with `revalidatePath("/kho-tang")`.
4. **actions/vote.ts**: Replace `revalidatePath("/dong-ngon")` with `revalidatePath("/kho-tang")`.

## Rollback Strategy
If changing these paths causes unintended navigation consequences, we can revert the specific files back to using `/dong-ngon` and instead implement a `next.config.ts` rewrite from `/dong-ngon` to `/kho-tang` as a fallback.

## Verification Plan
### Manual Verification
1. Run `npm run build` to ensure no build errors are introduced.
2. Run `npm run dev`. Navigate to `/kho-tang`.
3. Click on a work to open `app/work/[id]`.
4. Click the "&larr; Quay lại" button and verify it navigates back to `/kho-tang` instead of throwing a 404 error.
