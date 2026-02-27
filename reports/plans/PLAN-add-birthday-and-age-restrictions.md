# PLAN: Add Birthday & Age Restrictions to Existing Users

## Prerequisites
- **Scout Report**: `reports/scouts/SCOUT-add-birthday-and-age-restrictions.md`
- **Goal**: Implement non-modifiable birthday field in account settings and prompt users to rate their old works.

## Implementation Steps

### Checkpoint 1: Expose Birthday to Settings
- [ ] Modify `app/settings/page.tsx` to include `birthday` in the profile fetch.
- [ ] Update `components/settings/SettingsClient.tsx` to pass `initialBirthday` to `<ProfileTab />`.

### Checkpoint 2: Update Profile Tab UI
- [ ] In `components/settings/ProfileTab.tsx`, add state for `birthday`.
- [ ] Render a readonly (disabled) input for birthday IF `initialBirthday` exists.
- [ ] Render a standard date-picker input IF `initialBirthday` is null or empty.
- [ ] If `initialBirthday` is null, also show a warning banner asking them to update their birthday. Wait, no, they are already on the page where we are asking for it.
- [ ] Render a warning banner on `ProfileTab`: "Một số tác phẩm cũ của bạn có thể đang thiếu phân loại độ tuổi. Vui lòng kiểm tra và cập nhật!"

### Checkpoint 3: Update Profile Action
- [ ] View `actions/profile.ts`.
- [ ] Update the `updateProfile` function signature to accept `birthday?: string`.
- [ ] Validate birthday before updating (e.g. max age, future dates).
- [ ] Only execute an `update` on `birthday` if the current profile `birthday` is null/empty in the DB. This serves as backend enforcer for the "cannot modify after set" requirement.

## Exit Criteria
- Settings page shows Birthday.
- Can set birthday once.
- Once set, the input is disabled and cannot be changed.
- User sees a banner asking them to classify old works.
