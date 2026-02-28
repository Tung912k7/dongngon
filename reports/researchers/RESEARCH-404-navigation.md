# Research Report: Back Navigation Fix

## Findings
- The application uses `app/kho-tang/page.tsx` for the main feed/repository of works.
- The homepage at `app/page.tsx` also displays a feed via `<CumulativeSection />`. 
- However, since `/dong-ngon` no longer exists, replacing `href="/dong-ngon"` with `href="/kho-tang"` is the most robust solution for the "Back" button on the Work page.
- Using `router.back()` as an alternative could be problematic if a user visits the Work page directly via a shared link (as `router.back()` would lack sufficient history to return to the site's feed). An explicit `<Link href="/kho-tang">` ensures a consistent off-ramp for the user.

## Conclusion
We will update the `<Link>` components in `app/work/[id]/page.tsx` to point to `/kho-tang` instead of the broken `/dong-ngon` route. Additionally, we will update the cache revalidation keys in backend actions to target `/kho-tang`.
