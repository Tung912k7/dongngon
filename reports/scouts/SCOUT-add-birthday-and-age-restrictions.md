# SCOUT: Birthday & Age Restrictions

## Existing Architecture
- **Settings Page**: `app/settings/page.tsx` fetches profile from `profiles` table and passes to `SettingsClient`. It needs to also fetch `birthday`.
- **Profile Tab**: `components/settings/ProfileTab.tsx` contains a form to update user info. We need to add a Birthday field.
- **Backend API**: `actions/profile.ts` is called to update profile details. Need to add `birthday` to the update logic.

## Integration Points
1. `app/settings/page.tsx`: Fetch `birthday` from Supabase `profiles` table.
2. `components/settings/SettingsClient.tsx`: Pass `initialBirthday` to `ProfileTab`.
3. `components/settings/ProfileTab.tsx`:
   - Add state for `birthday`.
   - Add UI Date input field (disabled if `initialBirthday` is already set).
   - Display a banner/alert prompting user to add age rating to old works (as per user request).
4. `actions/profile.ts`: Update the `updateProfile` function to accept and save `birthday` (with backend validation to prevent overriding if already set).

## Plan
We will update these 4 files. No new database columns are needed as `birthday` already exists in `profiles`.
