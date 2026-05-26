# CLAUDE.md — Đồng ngôn Project Conventions

> Guidelines for developers working on this project. Follow these patterns to maintain consistency and code quality.

---

## 📁 Folder Structure & Responsibilities

```
├── app/                    # Next.js App Router pages & layouts
├── components/             # React components (UI, forms, modals)
├── actions/               # Server actions (data mutations, business logic)
├── lib/                   # Core utilities (logger, OG generation)
├── utils/                 # Helper functions (validation, sanitization, errors)
├── stores/                # Zustand state management
├── types/                 # TypeScript type definitions
├── supabase/              # Supabase client setup
├── public/                # Static assets
└── data/                  # Static data, sample content
```

### Key Rules by Folder:

| Folder | Rule | Example |
|--------|------|---------|
| **app/** | Pages only, no business logic | `app/work/[id]/page.tsx` |
| **components/** | UI-only, no data fetching | `components/WorkCard.tsx` |
| **actions/** | Server actions, mutations | `actions/work.ts` → `createWork()` |
| **utils/** | Pure functions, reusable | `utils/validation.ts` → `validateTitle()` |
| **stores/** | Zustand stores only | `stores/work-store.ts` → `useWorkStore()` |
| **lib/** | Core services | `lib/logger.ts` |

---

## 🔄 Patterns & Architecture

### 1️⃣ Server Actions Pattern

**File:** `actions/[feature].ts`

All server actions must:
- Start with `"use server"`
- Have explicit input type (use interface, not `any`)
- Return `{ success: true, data: T } | { error: string }`
- Include rate limiting check
- Include authentication check
- Sanitize + validate all inputs
- Use error handler for consistent messaging
- Log important operations

```typescript
"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { getErrorMessage } from "@/utils/error-handler";

interface CreateWorkInput {
  title: string;
  category_type: string;
  license: "public" | "private";
}

export async function createWork(input: CreateWorkInput) {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required" };

  // 2. Rate limit check
  const rateLimit = await checkRateLimitDistributed(
    supabase,
    `create-work:${user.id}`,
    6,
    60 * 60 * 1000 // 6 per hour
  );
  if (!rateLimit.allowed) {
    return { error: `Rate limited. Retry in ${rateLimit.retryAfterSeconds}s` };
  }

  // 3. Input validation
  if (!input.title?.trim() || input.title.length < 2) {
    return { error: "Title must be at least 2 characters" };
  }

  // 4. Business logic
  try {
    const { data, error } = await supabase
      .from("works")
      .insert([{ ...input, created_by: user.id }])
      .select()
      .single();

    if (error) throw error;

    logger.log("Work created", { workId: data.id, userId: user.id });
    
    // Revalidate cache
    revalidatePath("/kho-tang");
    
    return { success: true, data };
  } catch (err) {
    const message = getErrorMessage(err);
    logger.error("Create work failed", err, { userId: user.id });
    return { error: message };
  }
}
```

### 2️⃣ Component Pattern

**File:** `components/[Feature].tsx`

Components should:
- Be memo-wrapped if frequently rendered
- Accept props with strict typing
- Avoid data fetching (use server actions + suspense)
- Use useCallback for event handlers
- Separate concerns: UI logic vs state management

```typescript
import { memo, useCallback, useState } from "react";
import { Work } from "@/stores/work-store";

interface WorkCardProps {
  work: Work;
  isOwner?: boolean;
  onPreview?: (work: Work) => void;
  onEdit?: (work: Work) => void;
}

const WorkCard = memo(function WorkCard({
  work,
  isOwner = false,
  onPreview,
  onEdit,
}: WorkCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePreview = useCallback(() => {
    onPreview?.(work);
  }, [work, onPreview]);

  return (
    <article className="work-card">
      {/* UI only */}
      <h3>{work.title}</h3>
      {isOwner && (
        <button onClick={handlePreview}>Preview</button>
      )}
    </article>
  );
});

export default WorkCard;
```

### 3️⃣ Zustand Store Pattern

**File:** `stores/[feature]-store.ts`

Stores must:
- Have explicit interface for state shape
- Include only UI state (filters, pagination, modals)
- Use shallow comparisons for selectors
- Keep selectors in components, not store

```typescript
import { create } from "zustand";

interface WorkState {
  allWorks: Work[];
  filters: FilterState;
  currentPage: number;
  isLoading: boolean;
  
  setAllWorks: (works: Work[]) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  allWorks: [],
  filters: defaultFilters,
  currentPage: 1,
  isLoading: false,
  
  setAllWorks: (works) => set({ allWorks: works }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset on filter change
    })),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
```

### 4️⃣ Utility Function Pattern

**File:** `utils/[category].ts`

Utilities must:
- Be pure functions (no side effects)
- Have clear, single responsibility
- Include JSDoc comments
- Have test coverage

```typescript
/**
 * Validates a work title
 * @param title - The title to validate
 * @returns true if valid, false otherwise
 */
export function validateTitle(title: string): boolean {
  if (!title || typeof title !== "string") return false;
  const trimmed = title.trim();
  return trimmed.length >= 2 && trimmed.length <= 200;
}

/**
 * Sanitizes a title for XSS prevention
 * @param title - Raw title input
 * @returns Sanitized title safe for display
 */
export function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/[<>"]/g, "")
    .slice(0, 200);
}
```

---

## 🛡️ Error Handling

### Standard Error Pattern

Use `getErrorMessage()` for user-facing errors:

```typescript
// actions/work.ts
try {
  const { data, error } = await supabase.from("works").insert(...);
  if (error) throw error;
  return { success: true, data };
} catch (err) {
  const message = getErrorMessage(err); // Maps DB errors to Vietnamese UI messages
  return { error: message };
}
```

### Error Categories

Errors are mapped in `utils/error-handler.ts`:
- `23505`: Duplicate key (nickname exists)
- `23514`: Check constraint (content violates rules)
- `42501`: Permission denied
- `P0001`: Custom business logic error

**Add new errors there**, not in components.

---

## 🧪 Testing Requirements

### Test File Location

Tests live alongside source files:
```
components/WorkCard.tsx
components/__tests__/WorkCard.test.ts

actions/work.ts
actions/__tests__/work.test.ts
```

### Test Pattern for Actions

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWork } from "../work";
import { createClient } from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server");

describe("createWork", () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      auth: { getUser: vi.fn() },
      from: vi.fn(),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase);
  });

  it("should return error if not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    
    const result = await createWork({ title: "Test", category_type: "Thơ", license: "public" });
    
    expect(result).toEqual({ error: "Authentication required" });
  });

  it("should create work with valid input", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "work-123", title: "Test" },
        error: null,
      }),
    });

    const result = await createWork({
      title: "Test Work",
      category_type: "Thơ",
      license: "public",
    });

    expect(result.success).toBe(true);
  });

  it("should enforce rate limiting", async () => {
    // Mock rate limit exceeded
    const result = await createWork(...);
    expect(result.error).toContain("Rate limited");
  });
});
```

---

## 📝 Naming Conventions

### Files & Folders
- Components: `PascalCase` → `WorkCard.tsx`
- Utilities: `camelCase` → `error-handler.ts`
- Actions: `camelCase` → `create-work.ts` or group as `work.ts` (multiple exports)
- Types: `PascalCase` → `Work`, `FilterState`

### Variables & Functions
- Constants: `UPPER_SNAKE_CASE` → `CREATE_WORK_LIMIT`
- Functions: `camelCase` → `createWork()`, `validateTitle()`
- Boolean: `is*` or `has*` → `isOwner`, `hasError`
- Callback handlers: `on*` → `onEdit`, `onPreview`

### Database Fields
- Timestamps: `created_at`, `updated_at` (PostgreSQL defaults)
- Booleans: `is_*` → `is_author_private`
- Foreign keys: `{table}_id` → `created_by`, `work_id`
- Categories: Vietnamese names → `category_type`, `hinh_thuc`, `writing_rule`

---

## 🔐 Security Checklist

Every action must:
- ✅ Authenticate user (`await supabase.auth.getUser()`)
- ✅ Check permissions (owner check, admin check)
- ✅ Rate limit (use `checkRateLimitDistributed()`)
- ✅ Validate input (use validators in `utils/validation.ts`)
- ✅ Sanitize input (use sanitizers in `utils/sanitizer.ts`)
- ✅ Never log secrets, passwords, or tokens
- ✅ Use parameterized queries (Supabase does this by default)
- ✅ Return user-friendly error messages

---

## 🎨 Styling Rules

### Tailwind + CSS Modules
- Use Tailwind utility classes for 95% of styling
- Use CSS modules only for complex animations or dynamic styles
- Keep component styles co-located: `Component.tsx` + `Component.module.css`
- No inline `style={}` objects

```typescript
// ✅ Good
<div className="flex gap-4 rounded-lg bg-white">Content</div>

// ❌ Avoid
<div style={{ display: "flex", gap: "16px" }}>Content</div>
```

### Color System
Define colors in `tailwind.config.ts`:
```javascript
colors: {
  "literary-black": "#171717",
  "literary-gold": "#D4AF37",
}
```

Use semantic names:
```typescript
className="bg-literary-black text-literary-gold" // ✅ Clear intent
className="bg-gray-900 text-yellow-600"           // ❌ Less semantic
```

---

## 📊 State Management Rules

### When to Use What

| Use Case | Tool | Location |
|----------|------|----------|
| Form state | `useState` | Component |
| UI filters/pagination | `Zustand` | `stores/` |
| Server data (cached) | React Query (if added) | To be determined |
| Global user session | Server action result | Page props |
| Animation state | `useState` + `Framer Motion` | Component |

### Zustand Store Rules
- Store only **UI state** (filters, modals, pagination)
- Never store **server data** (fetched from DB)
- Reset filters when navigating: `setCurrentPage(1)`
- Use shallow equality for selectors

---

## 🚀 Deployment Checklist

See [DEPLOYMENT.md](./DEPLOYMENT.md) for pre-deploy verification steps.

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx (server-only)
NEXT_PUBLIC_POSTHOG_KEY=xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://xxxxx
```

---

## 🔍 Code Review Checklist

Before submitting PR, ensure:
- [ ] No `any` types
- [ ] No `console.log()` in production code
- [ ] All server actions have auth check
- [ ] All inputs are validated + sanitized
- [ ] Error messages are user-friendly (Vietnamese)
- [ ] Tests pass: `npm run test:unit`
- [ ] Linting passes: `npm run lint`
- [ ] Format check passes: `npm run format:check`
- [ ] Component uses `memo` if needed
- [ ] No hardcoded API keys or secrets

---

## 📚 Resources

- Next.js Docs: https://nextjs.org/docs
- React 19 Docs: https://react.dev
- Zustand: https://github.com/pmndrs/zustand
- Supabase JS: https://supabase.com/docs/reference/javascript
- Vitest: https://vitest.dev/

---

**Last Updated:** 2026-05-21  
**Maintainers:** Đồng ngôn Team  
**Questions?** Create an issue or ask in team chat
