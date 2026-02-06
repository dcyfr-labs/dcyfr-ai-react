# AGENTS.md - @dcyfr/ai-react

## Project Overview

React SPA starter template using React 19, TypeScript, Vite 6, TanStack Router, Zustand, and Tailwind CSS.

## Architecture

- **Entry:** `src/main.tsx` wraps app in StrictMode + QueryClientProvider + RouterProvider
- **Routing:** TanStack Router with type-safe route definitions in `src/routes/router.tsx`
- **State:** Zustand stores in `src/stores/` (counter example, theme with persistence)
- **Components:** UI primitives in `src/components/ui/`, layout in `src/components/layout/`
- **Services:** Typed API client in `src/services/api-client.ts` with Zod validation
- **Hooks:** Reusable hooks in `src/hooks/` (debounce, localStorage, mediaQuery)

## Conventions

- Use `cn()` from `@/lib/utils` for className merging
- All components support `className` prop for composition
- Barrel exports from each directory via `index.ts`
- Path alias: `@/*` maps to `./src/*`
- Tests live in `tests/` mirroring `src/` structure

## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run test:run     # Run all tests
npm run test:watch   # Watch mode
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

## Testing

- Framework: Vitest 2.1 + React Testing Library 16.1
- Environment: jsdom 25
- Setup: `tests/setup.ts` (jest-dom matchers)
- 57 tests across 8 test files
