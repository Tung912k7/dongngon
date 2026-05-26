# TEST_GUIDE.md — Testing Strategy for Đồng ngôn

> Complete guide for writing and running tests. Use this with template files in `actions/__tests__/` and `components/__tests__/`.

---

## 🎯 Testing Overview

### What We Test

| Layer | Priority | Tools | Coverage |
|-------|----------|-------|----------|
| **Server Actions** | 🔴 HIGH | Vitest + mocks | 60%+ |
| **Utilities** | 🔴 HIGH | Vitest | 80%+ |
| **Components** | 🟡 MEDIUM | Vitest + React Testing Library | 40%+ |
| **E2E Flows** | 🟡 MEDIUM | Playwright (optional) | Key paths |

### Success Criteria

```
✅ All tests pass locally: npm run test:unit
✅ 60%+ code coverage for critical paths
✅ New features include tests before merge
✅ Bugs fixed with failing test first (TDD)
```

---

## 🚀 Quick Start

### Run Tests

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode (auto-rerun on changes)
npm run test:unit -- --watch

# Run tests with coverage report
npm run test:unit -- --coverage

# Run specific test file
npm run test:unit -- actions/__tests__/work.test.ts

# Run tests matching pattern
npm run test:unit -- --grep "createWork"
```

### Test File Structure

```
actions/
├── work.ts                        # Source file
└── __tests__/
    ├── template.test.ts          # Reference template
    ├── work.test.ts              # Actual tests (copy from template)
    ├── auth.template.test.ts     # Auth action examples
    └── vote.test.ts              # Another action tests

components/
├── WorkCard.tsx                   # Source file
└── __tests__/
    └── WorkCard.test.ts          # Component tests
```

---

## 📝 Writing Tests: Step-by-Step

### Step 1: Copy the Template

```bash
# For server actions
cp actions/__tests__/template.test.ts actions/__tests__/your-action.test.ts

# For authentication
cp actions/__tests__/auth.template.test.ts actions/__tests__/auth.test.ts
```

### Step 2: Customize for Your Action

**Before:**
```typescript
describe("Work Actions", () => {
  // Generic tests
});
```

**After:**
```typescript
describe("Vote Actions", () => {
  // Your specific tests
});
```

### Step 3: Write Test Cases

Follow this structure:

```typescript
describe("featureName", () => {
  // Setup
  beforeEach(() => {
    // Initialize mocks
  });

  // Group related tests
  describe("Success Cases", () => {
    it("should do X when given Y", () => {
      // Arrange: Setup data
      const input = { /* ... */ };

      // Act: Call the function
      const result = await myAction(input);

      // Assert: Check the result
      expect(result).toEqual({ success: true });
    });
  });

  describe("Error Cases", () => {
    it("should return error when not authenticated", () => {
      // ...
    });
  });
});
```

---

## 🎭 Mocking Supabase

### Mock Setup Pattern

```typescript
import { vi } from "vitest";
import { createClient } from "@/utils/supabase/server";

vi.mock("@/utils/supabase/server");

let mockSupabase;

beforeEach(() => {
  mockSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-123", email: "user@test.com" } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: "123" },
      error: null,
    }),
  };

  vi.mocked(createClient).mockResolvedValue(mockSupabase);
});
```

### Common Mock Scenarios

#### Scenario 1: Successful Query

```typescript
mockSupabase.from("works").select("*").eq("id", "work-123").single.mockResolvedValue({
  data: { id: "work-123", title: "My Work" },
  error: null,
});

const result = await getWork({ id: "work-123" });
expect(result.success).toBe(true);
```

#### Scenario 2: Database Error

```typescript
mockSupabase.single.mockResolvedValue({
  data: null,
  error: {
    code: "23505", // Unique constraint violation
    message: "duplicate key",
  },
});

const result = await createWork({ title: "Duplicate" });
expect(result.error).toBeDefined();
```

#### Scenario 3: Not Authenticated

```typescript
mockSupabase.auth.getUser.mockResolvedValue({
  data: { user: null },
  error: null,
});

const result = await createWork({ title: "Test" });
expect(result.error).toContain("đăng nhập");
```

---

## ✅ Test Checklist for Server Actions

Before marking a test complete:

- [ ] **Authentication** — Only authenticated users can proceed
- [ ] **Authorization** — User has permission (owner check, admin check)
- [ ] **Input Validation** — Invalid inputs are rejected
- [ ] **Rate Limiting** — Rate limits are enforced
- [ ] **Success Path** — Happy path works correctly
- [ ] **Error Handling** — Errors are handled gracefully
- [ ] **Side Effects** — Database calls, cache invalidation, logging
- [ ] **Edge Cases** — Empty strings, null values, duplicates, etc.

---

## 📊 Common Test Patterns

### Pattern 1: Testing Rate Limits

```typescript
import * as rateLimit from "@/utils/rate-limit";

vi.mock("@/utils/rate-limit");

describe("Rate Limiting", () => {
  it("should enforce rate limit", async () => {
    vi.mocked(rateLimit.checkRateLimitDistributed).mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 3600,
    });

    const result = await createWork({ title: "Test" });

    expect(result.error).toContain("quá nhanh");
    expect(result.error).toContain("3600");
  });

  it("should allow request within limit", async () => {
    vi.mocked(rateLimit.checkRateLimitDistributed).mockResolvedValue({
      allowed: true,
      retryAfterSeconds: 0,
    });

    const result = await createWork({ title: "Test" });

    expect(result.success).toBe(true);
  });
});
```

### Pattern 2: Testing Validation

```typescript
describe("Input Validation", () => {
  const invalidCases = [
    { input: { title: "" }, error: "ký tự" },
    { input: { title: "a" }, error: "ký tự" },
    { input: { title: "toolongname".repeat(100) }, error: "quá dài" },
  ];

  invalidCases.forEach(({ input, error }) => {
    it(`should reject ${error}`, async () => {
      const result = await createWork(input);
      expect(result.error).toContain(error);
    });
  });
});
```

### Pattern 3: Testing Authorization

```typescript
describe("Authorization", () => {
  it("should allow owner to update work", async () => {
    // Mock work owned by current user
    mockSupabase.single.mockResolvedValue({
      data: { created_by: "user-123" },
    });

    const result = await updateWork({ id: "work-123", title: "Updated" });

    expect(result.success).toBe(true);
  });

  it("should prevent non-owner from updating work", async () => {
    // Mock work owned by different user
    mockSupabase.single.mockResolvedValue({
      data: { created_by: "other-user" },
    });

    const result = await updateWork({ id: "work-123", title: "Updated" });

    expect(result.error).toContain("quyền");
  });
});
```

### Pattern 4: Testing Side Effects

```typescript
import { revalidatePath } from "next/cache";

vi.mock("next/cache");

describe("Side Effects", () => {
  it("should revalidate cache after creation", async () => {
    await createWork({ title: "Test", /* ... */ });

    expect(revalidatePath).toHaveBeenCalledWith("/kho-tang");
  });

  it("should log important operations", async () => {
    const logSpy = vi.spyOn(console, "log");

    await createWork({ title: "Test", /* ... */ });

    expect(logSpy).toHaveBeenCalled();
  });
});
```

---

## 🧪 Testing Best Practices

### ✅ DO

```typescript
// ✅ Clear test names that describe behavior
it("should return error if not authenticated")

// ✅ Use arrange-act-assert pattern
it("should create work", () => {
  const input = { title: "Test" };  // Arrange
  const result = await action(input);  // Act
  expect(result.success).toBe(true);  // Assert
});

// ✅ Test one thing per test
it("should validate title length")

// ✅ Use realistic test data
const work = { title: "Thơ tự do", category_type: "Thơ" }

// ✅ Mock external dependencies
vi.mock("@/utils/supabase/server")
```

### ❌ DON'T

```typescript
// ❌ Vague test names
it("should work")

// ❌ Multiple assertions on different concerns
it("should create and revalidate and log")

// ❌ Test implementation details
expect(mockSupabase.from).toHaveBeenCalledWith("works")  // Implementation detail
expect(result.success).toBe(true)  // ✅ Result is behavior

// ❌ Tests that depend on other tests
it("test 1")  // Don't rely on test 2 to set up state
it("test 2")

// ❌ Hardcoded magic numbers
mockSupabase.single.mockResolvedValueOnce(data)  // Why is it 1?
// Instead: mockSupabase.from("works").select().single()
```

---

## 🔍 Debugging Tests

### Run Single Test

```bash
npm run test:unit -- --grep "createWork"
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:unit -- --watch
```

### View Coverage Report

```bash
npm run test:unit -- --coverage

# Open in browser (if generated)
open coverage/index.html
```

### Print Debug Info

```typescript
it("should create work", async () => {
  const result = await createWork({ /* ... */ });
  console.log(result);  // ✅ Will print in test output
  expect(result.success).toBe(true);
});
```

### Check Mock Calls

```typescript
it("should call Supabase", async () => {
  await createWork({ /* ... */ });

  // Debug: Print all calls
  console.log(mockSupabase.from.mock.calls);

  expect(mockSupabase.from).toHaveBeenCalled();
});
```

---

## 📋 Test Coverage Targets

### Priority 1 (Must Test)

```
✅ actions/work.ts → 80% coverage
   - createWork: CRITICAL
   - updateWork: HIGH
   - deleteWork: HIGH

✅ actions/auth.ts → 90% coverage
   - signUp: CRITICAL
   - signIn: CRITICAL
   - changePassword: HIGH

✅ utils/validation.ts → 100% coverage
   - validateTitle: CRITICAL
   - validateEmail: CRITICAL

✅ utils/error-handler.ts → 95% coverage
   - getErrorMessage: CRITICAL
```

### Priority 2 (Should Test)

```
🟡 actions/vote.ts → 60% coverage
🟡 actions/notification.ts → 60% coverage
🟡 utils/rate-limit.ts → 70% coverage
```

### Priority 3 (Nice to Test)

```
🔵 components/WorkCard.tsx → 40% coverage
🔵 components/AuthForms.tsx → 40% coverage
```

---

## 🚀 Testing Workflow

### When Adding a New Action

1. **Create test file** from template
2. **Write failing tests** (TDD approach)
3. **Implement action** to make tests pass
4. **Verify coverage** > 60%
5. **Commit** with tests

```bash
# Step 1-2
cp actions/__tests__/template.test.ts actions/__tests__/myaction.test.ts
# Edit test file with your test cases

# Step 3
# Implement actions/myaction.ts

# Step 4
npm run test:unit -- actions/__tests__/myaction.test.ts

# Step 5
npm run test:unit -- --coverage
git add -A && git commit -m "feat: add myaction with tests"
```

### When Fixing a Bug

1. **Write failing test** that reproduces bug
2. **Fix implementation**
3. **Verify test passes**
4. **Check no regressions** (run all tests)

```bash
# Step 1: Reproduce bug in test
it("should handle edge case X", () => {
  // This test fails before the fix
});

# Step 2-3: Fix and verify
# Edit actions/work.ts
npm run test:unit -- actions/__tests__/work.test.ts

# Step 4: Verify all tests still pass
npm run test:unit
```

---

## 📚 Resources

- **Vitest Docs:** https://vitest.dev/
- **Test Examples:** See `template.test.ts` and `auth.template.test.ts`
- **Mocking Guide:** https://vitest.dev/api/vi
- **Best Practices:** https://testingjavascript.com/

---

## ❓ FAQ

**Q: How do I test async functions?**
```typescript
it("should handle async", async () => {
  const result = await myAsyncFunction();
  expect(result).toBe(expected);
});
```

**Q: How do I mock a function that throws?**
```typescript
mockFunction.mockRejectedValue(new Error("Failed"));
// or
mockFunction.mockImplementation(() => {
  throw new Error("Failed");
});
```

**Q: How do I run tests on CI/CD?**
```bash
# In your CI script:
npm run lint
npm run test:unit
npm run build
```

**Q: Do I need to test everything?**
No, focus on:
- 🔴 Business logic (actions, validations)
- 🔴 Security (auth, permissions)
- 🟡 Edge cases (errors, limits)
- 🔵 UI components (if complex)

---

**Last Updated:** 2026-05-21  
**Maintained By:** Development Team
