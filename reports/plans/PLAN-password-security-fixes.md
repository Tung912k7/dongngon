# PLAN: Password Security Fixes

## Goal
Fix critical password length and complexity validation issues outlined in `bug.md`.

## Steps
1. **Frontend Validation Upgrade (`AuthForms.tsx`)**
   - Locate the `handleSubmit` inside `SignUpForm`.
   - Before submission, validate the `password` field stringently according to backend limits:
     - `length >= 8`
     - `length <= 50`
     - Contains lowercase (`[a-z]`)
     - Contains uppercase (`[A-Z]`)
     - Contains digit (`\d` or `[0-9]`)
     - Contains special char (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]`)
   - Re-route errors from default "6 chars limit" to specific helpful user errors pointing out which criteria is missing.

2. **Backend Error Translation (`AuthForms.tsx`)**
   - Translate the catch block for `authError.message === "Password should be at least 6 characters"` to handle whatever Supabase actually throws, or safely just throw "Mật khẩu không đáp ứng yêu cầu bảo mật." to prevent fallback confusion.

3. **Visual Requirements Component (`AuthForms.tsx`)**
   - In the JSX form, just beneath the Password `InputField` but before the Checkboxes, render a section clearly displaying: "Yêu cầu mật khẩu: Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt."

4. **Review & Test**
   - The new regexes comprehensively satisfy the backend requirements BEFORE hitting Supabase. 
