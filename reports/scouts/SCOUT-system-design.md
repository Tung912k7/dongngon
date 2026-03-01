# Scout Report: System Design Discussion

## Exploration Scope
- Target: State management patterns, rendering strategies, and main interaction logic (Editor focus).
- Boundaries: `components/`, `app/`, `utils/`.

## Patterns Discovered
### Pattern: Local Component State (React hooks)
- **Location**: `components/DongNgonClient.tsx`, `components/Editor.tsx`
- **Usage**: The application heavily relies on local `useState` for Managing filters, lists, and form inputs. State is managed at the component level and passed down.
- **Must Follow**: Yes (until a global state solution is introduced).

### Pattern: Real-time via Supabase Channels
- **Location**: `components/DongNgonClient.tsx:L151-213`
- **Usage**: Subscribes to `postgres_changes` on the `works` table to update the local list of works in real-time.
- **Must Follow**: Yes (current real-time strategy).

### Pattern: Hybrid Hydration (Next.js App Router)
- **Location**: `app/kho-tang/page.tsx` (inferred), `components/DongNgonClient.tsx`
- **Usage**: Passes `initialWorks` from Server Components to Client Components, which then take over state (hydration).
- **Must Follow**: Yes.

## Integration Points
| Point | File | Function | New Code Location |
| ------ | ------ | -------- | ----------------- |
| Global State Entry | `components/ClientGlobalWrappers.tsx` | `ClientGlobalWrappers` | Wrap new context providers here. |
| Real-time Logic | `components/DongNgonClient.tsx` | `useEffect` | Move sync logic to a dedicated store/hook if complexity grows. |
| Editor Core | `components/Editor.tsx` | `handleSubmit` | Decouple validation and submission logic from UI component. |

## Conventions
- Naming: `PascalCase` for components, `camelCase` for hooks/functions.
- File organization: `components/` for UI, `utils/` for shared logic, `app/` for routing.

## Warnings
- ⚠️ **Prop Drilling**: As complexity increases, passing `user` and `filters` down multiple levels in `DongNgonClient` and `Editor` will become hard to maintain.
- ⚠️ **Stale Closures**: Real-time channel listeners in `DongNgonClient` already require careful dependency management for the `user` object to avoid security/logic bugs.
- ⚠️ **Single-user Bias**: The current `submitContribution` action is a simple atomic insert; it lacks the delta/CRDT logic needed for multi-user real-time typing.
