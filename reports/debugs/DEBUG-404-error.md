# Debug Report: 404 Error on Back Navigation

## Bug Characterization
| Attribute   | Value          |
| ----------- | -------------- |
| Description | 404 error when pressing back after opening a work |
| Severity    | High |
| Reproduction | Open any work from the feed. Click the "<- Quay lại" button or any "Quay lại trang chủ" button on the work page. Observe a 404 Not Found error. |

## Root Cause
**Hardcoded Links to Missing Route**
The work page (`app/work/[id]/page.tsx`) has three different `Link` components that point to `href="/dong-ngon"`. However, the `/dong-ngon` route does not exist in the Next.js `app` directory (the main feed route appears to be `/kho-tang` or `/`). Because there is no rewrite logic in `next.config.ts` either, navigating to `/dong-ngon` natively triggers a 404.

## Fix
Replace all instances of `href="/dong-ngon"` in `app/work/[id]/page.tsx` with the correct destination path (e.g. `href="/kho-tang"`). Also check `actions/work.ts` which uses `revalidatePath("/dong-ngon")` and needs updating.

## Verification
- [ ] Test case added (N/A for simple link changes, but manual testing will verify).
- [ ] Regression checked (Ensure back button routes successfully).
