# Implementation Plan: Enable Dark Mode & Language Settings

## Goal Description
The objective is to make the "Giao diện" (Dark Mode) and "Ngôn ngữ" (Language) toggles in the Settings actually functional.

## Proposed Changes
### 1. Dark Mode (next-themes + CSS Variable Inversion)
Since the app heavily uses hardcoded `bg-white`, `text-black`, and `gray-*` classes across ~50 files, manually updating every file to support `dark:` variants is highly risky and massive. 
**Solution:**
- Install `next-themes` to manage the `dark` class on the HTML tag and persist it in `localStorage`.
- In `app/globals.css`, inject a `.dark` scope that **inverts** the Tailwind v4 base color variables. For example, `--color-white` becomes a dark slate, and `--color-black` becomes a light slate. This instantly applies a beautiful dark mode globally without touching 50 component files.
- Update `components/settings/InterfaceTab.tsx` to read/write the theme from `useTheme()` provided by `next-themes`.

### 2. Language Toggle (React Context + Local Storage)
Full application internationalization (i18n) typically requires extracting every single text node in the app. However, to make the toggle functionally working immediately:
- Create `components/LanguageProvider.tsx` using React Context to manage `vi` and `en` states, persisted in `localStorage`.
- Create a dictionary (`utils/translations.ts`) for core UI elements (like Header navigation and Settings menus).
- Update `components/Header.tsx` and `components/settings/InterfaceTab.tsx` to consume `useLanguage()` and translate their strings. This proves the feature works and provides a foundation to translate other pages gradually.

## Verification Plan
### Automated Verification
- Run `npm run build` to ensure no build errors are introduced.

### Manual Verification
1. Open the dev server (`npm run dev`).
2. Go to the Settings page (`/settings`).
3. Click the Dark Mode toggle. The entire application should instantly switch to a dark palette, and the state should persist upon page refresh.
4. Click the Language toggle to "English". The texts in the Settings tab and Header should translate to English immediately, and persist on refresh.
