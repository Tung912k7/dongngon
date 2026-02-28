# Implementation Plan: Suspend One-Character Rule

## Goal Description
The user wants to temporarily suspend the "1 kí tự" (1 character) rule from the website, ensuring that any new works created can only use the "1 câu" (1 sentence) rule. Existing works that use the 1 character rule must not be broken or altered. 

## Proposed Changes

### [app/components/CreateWorkModal.tsx](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/components/CreateWorkModal.tsx)
- Hide or disable the "1 kí tự" option from the `<select>` dropdown for "QUY TẮC".
- Ensure the default `writing_rule` remains "1 câu".

### [actions/work.ts](file:///c:/Users/LAPTOP/Desktop/Projects/Website/dongngon/actions/work.ts)
- Add backend validation in `createWork` to explicitly reject any creation request that tries to pass `writing_rule: "1 kí tự"`.
- Return an error message: `{"error": "Quy tắc 1 kí tự đang tạm thời bị khóa."}` if it is passed.
- Leave existing mapping logic intact so that the system still understands "character" if it reads it from the database for existing works.

## Verification Plan

### Manual Verification
1. Run `npm run build` and `npm run dev` to ensure no compile errors.
2. Open the browser and click "Tạo Tác Phẩm" (Create Work).
3. Verify that the "QUY TẮC" dropdown only contains "1 câu".
4. Try to submit the form and verify a 1 sentence work is created successfully.
5. Manually verify an older work that uses the 1-character rule can still be viewed and contributed to (if possible).
