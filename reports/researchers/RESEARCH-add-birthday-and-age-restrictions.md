## Research: Adding Birthday to Supabase Auth & Age Restrictions to Works

### 1. Supabase Auth with Birthday
- **Supabase User Metadata:** Supabase allows storing additional user info via the `options.data` payload in `signUp`. 
  ```javascript
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: data.fullName,
        nickname: data.penName,
        birthday: data.birthday // Can be stored as 'YYYY-MM-DD'
      }
    }
  })
  ```
- **Profiles Trigger:** Typically, a database trigger or edge function inserts this `raw_user_meta_data` into the `profiles` table. Assuming "Database have birthday column" (as stated by user), the `profiles` table handles it or it's just stored in auth metadata.

### 2. UI Date Input
- Standard `<input type="date">` works perfectly for birthdays.
- Min/Max attributes can be used to prevent future dates.

### 3. Adding Age Restriction to Works
- Need a new field in the `works` table: `age_restriction` (VARCHAR/TEXT).
- Allowed values: `'all'`, `'13+'`, `'16+'`, `'18+'`.
- Since it's a new feature, a Supabase migration script should be created to add this column to the `works` table with a default value of `'all'`.
- `actions/work.ts` needs to accept `age_restriction` and pass it to the DB insert payload.
