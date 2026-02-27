# SCOUT: Password Security Fixes

## Existing Architecture
- **Auth System**: The application uses Supabase for authentication.
- **Frontend Form**: User registration occurs in `components/AuthForms.tsx`, specifically the `SignUpForm` component.
- **Validation Logic**: Handled minimally in the `handleSubmit` process of `SignUpForm`.

## Integration Points
1. `components/AuthForms.tsx`:
   - `handleSubmit`: Currently tests only if length is `< 6`. We need to expand this to regex checks for 8 chars, 1 uppercase, 1 lowercase, 1 digit, and 1 special character string, plus length <= 50.
   - `SignUpForm` JSX: Needs visual indication (text or list) showing the password requirements explicitly above/below the password input.
   - The error response parsing when submitting to supabase from `Password should be at least 6 characters` needs to be updated or removed if frontend catches it first.

## Plan
Update `AuthForms.tsx` to include strict frontend validation covering all OWASP standards mapped by Supabase configurations and display a persistent requirement list below the password field.
