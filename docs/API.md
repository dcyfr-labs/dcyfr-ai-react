# API Reference — @dcyfr/ai-react

**Production-ready React SPA starter template with comprehensive API documentation.**

Version: 1.0.0  
Last Updated: February 8, 2026

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Hooks API](#hooks-api)
4. [Components API](#components-api)
5. [Stores API (Zustand)](#stores-api-zustand)
6. [Services API](#services-api)
7. [Routing API (TanStack Router)](#routing-api-tanstack-router)
8. [Utilities API](#utilities-api)
9. [Configuration](#configuration)
10. [Type Definitions](#type-definitions)
11. [Migration Guide](#migration-guide)

---

## Installation

```bash
npm install @dcyfr/ai-react
# or
pnpm install @dcyfr/ai-react
# or
yarn add @dcyfr/ai-react
```

### Requirements

- **Node.js:** 18.x or higher
- **npm:** 10.x or higher
- **TypeScript:** 5.7+ (included)
- **React:** 19+ (included)

---

## Quick Start

```typescript
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

Start the development server:

```bash
npm run dev  # → http://localhost:3000
```

---

## Hooks API

### `useDebounce<T>`

Debounces a value with configurable delay.

**Import:**

```typescript
import { useDebounce } from '@/hooks';
```

**Type Signature:**

```typescript
function useDebounce<T>(value: T, delay?: number): T;
```

**Parameters:**

- `value` (T): Value to debounce
- `delay` (number, optional): Delay in milliseconds (default: 500ms)

**Returns:** Debounced value of type T

**Example:**

```typescript
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // Trigger search API call
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />;
}
```

---

### `useLocalStorage<T>`

Syncs state with localStorage with type safety.

**Import:**

```typescript
import { useLocalStorage } from '@/hooks';
```

**Type Signature:**

```typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void];
```

**Parameters:**

- `key` (string): localStorage key
- `initialValue` (T): Fallback value if key doesn't exist

**Returns:** Tuple of [storedValue, setValue]

**Example:**

```typescript
function UserPreferences() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

**Storage Format:** JSON serialization (handles objects, arrays, primitives)

---

### `useMediaQuery`

Responds to CSS media queries with SSR-safe hydration.

**Import:**

```typescript
import { useMediaQuery } from '@/hooks';
```

**Type Signature:**

```typescript
function useMediaQuery(query: string): boolean;
```

**Parameters:**

- `query` (string): CSS media query string

**Returns:** `true` if query matches, `false` otherwise

**Example:**

```typescript
function ResponsiveNav() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile ? <MobileNav /> : <DesktopNav />;
}
```

**Supported Queries:**

- `(max-width: 768px)` - Mobile devices
- `(min-width: 769px)` - Desktop devices
- `(prefers-color-scheme: dark)` - Dark mode preference
- Any valid CSS media query

---

## Components API

### `Button`

Versatile button component with variants and sizes.

**Import:**

```typescript
import { Button } from '@/components/ui';
```

**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**Variants:**

- `default` - Primary action button (blue background)
- `destructive` - Dangerous actions (red background)
- `outline` - Secondary actions (border only)
- `secondary` - Tertiary actions (gray background)
- `ghost` - Minimal styling
- `link` - Text link styling

**Example:**

```typescript
import { Button } from '@/components/ui';

function ActionButtons() {
  return (
    <div className="space-x-2">
      <Button variant="default" size="lg" onClick={handleSave}>
        Save
      </Button>
      <Button variant="destructive" size="default">
        Delete
      </Button>
      <Button variant="outline">Cancel</Button>
    </div>
  );
}
```

---

### `Card`

Container component for grouped content.

**Import:**

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
```

**Components:**

- `Card` - Root container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Example:**

```typescript
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Email: user@example.com</p>
  </CardContent>
  <CardFooter>
    <Button>Update Profile</Button>
  </CardFooter>
</Card>
```

---

### `Input`

Text input with error state support.

**Import:**

```typescript
import { Input } from '@/components/ui';
```

**Props:**

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
```

**Example:**

```typescript
const [email, setEmail] = useState('');
const [error, setError] = useState(false);

<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!email.includes('@')}
  placeholder="user@example.com"
/>;
```

**Styling:** Error state applies red border via `error` class utility.

---

### `Badge`

Small label component for status indicators.

**Import:**

```typescript
import { Badge } from '@/components/ui';
```

**Props:**

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}
```

**Example:**

```typescript
<Badge variant="default">New</Badge>
<Badge variant="secondary">Beta</Badge>
<Badge variant="destructive">Deprecated</Badge>
```

---

### `Spinner`

Loading indicator component.

**Import:**

```typescript
import { Spinner } from '@/components/ui';
```

**Props:**

```typescript
interface SpinnerProps extends React.SVGAttributes<SVGElement> {
  size?: number;
}
```

**Example:**

```typescript
function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size={48} />
    </div>
  );
}
```

---

## Stores API (Zustand)

### Counter Store

Example store demonstrating Zustand patterns.

**Import:**

```typescript
import { useCounterStore } from '@/stores';
```

**State Interface:**

```typescript
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  incrementBy: (amount: number) => void;
}
```

**Example:**

```typescript
function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

### Theme Store

Manages dark/light/system theme preference.

**Import:**

```typescript
import { useThemeStore } from '@/stores';
```

**State Interface:**

```typescript
type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark'; // Computed from system preference
}
```

**Example:**

```typescript
function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useThemeStore();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}
```

**Persistence:** Automatically syncs with localStorage (`theme` key).

---

## Services API

### API Client

Type-safe HTTP client with automatic error handling.

**Import:**

```typescript
import { apiClient } from '@/services';
```

**Methods:**

```typescript
interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: unknown): Promise<T>;
  put<T>(url: string, data: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}
```

**Example:**

```typescript
import { apiClient } from '@/services';

// GET request
interface User {
  id: number;
  name: string;
  email: string;
}

const user = await apiClient.get<User>('/api/users/123');

// POST request
const newUser = await apiClient.post<User>('/api/users', {
  name: 'Alice',
  email: 'alice@example.com',
});

// With React Query
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get<User>(`/api/users/${userId}`),
  });

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.name}</div>;
}
```

**Error Handling:** Automatically throws with HTTP status codes. Wrap in try/catch or use React Query's error boundary.

**Base URL Configuration:** Set via `API_BASE_URL` in `src/config/index.ts`.

---

## Routing API (TanStack Router)

### Route Definition

**File:** `src/routes/router.tsx`

**Pattern:**

```typescript
import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Page routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

// Route tree
const routeTree = rootRoute.addChildren([homeRoute, aboutRoute]);

// Router
export const router = createRouter({ routeTree });
```

---

### Navigation

**Link Component:**

```typescript
import { Link } from '@tanstack/react-router';

<Link to="/" className="nav-link">
  Home
</Link>
<Link to="/about" className="nav-link">
  About
</Link>
```

**Programmatic Navigation:**

```typescript
import { useNavigate } from '@tanstack/react-router';

function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // After successful login
    navigate({ to: '/dashboard' });
  };
}
```

---

### Route Parameters

**Dynamic Routes:**

```typescript
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserProfile,
});

// In component
function UserProfile() {
  const { userId } = Route.useParams();
  return <div>User ID: {userId}</div>;
}
```

**Search Params:**

```typescript
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || '',
    page: Number(search.page) || 1,
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, page } = Route.useSearch();
  return <div>Searching for: {q} (page {page})</div>;
}
```

---

## Utilities API

### `cn()` — Class Name Utility

Merges Tailwind CSS classes with conflict resolution.

**Import:**

```typescript
import { cn } from '@/lib/utils';
```

**Type Signature:**

```typescript
function cn(...inputs: ClassValue[]): string;
```

**Example:**

```typescript
import { cn } from '@/lib/utils';

function Alert({ variant, className }: { variant: 'info' | 'error'; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg p-4',
        variant === 'info' && 'bg-blue-100 text-blue-900',
        variant === 'error' && 'bg-red-100 text-red-900',
        className
      )}
    >
      Alert content
    </div>
  );
}
```

**Powered By:** `clsx` + `tailwind-merge` for intelligent class deduplication.

---

## Configuration

### Application Config

**File:** `src/config/index.ts`

```typescript
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  APP_NAME: 'DCYFR AI React',
  APP_VERSION: '1.0.0',
} as const;
```

**Environment Variables:**

Create `.env` file:

```bash
VITE_API_BASE_URL=https://api.production.com
```

**Usage:**

```typescript
import { config } from '@/config';

const apiUrl = config.API_BASE_URL; // Type-safe access
```

---

## Type Definitions

### Common Types

**User Type:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}
```

**API Response:**

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

**Pagination:**

```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}
```

---

## Migration Guide

### From CRA (Create React App)

1. **Remove CRA config:** Delete `react-scripts`, `public/index.html` entry
2. **Update entry point:** Rename `src/index.tsx` → `src/main.tsx`
3. **Add Vite config:** Copy `vite.config.ts` from this template
4. **Update imports:** Use `@/` path alias instead of relative paths
5. **Replace React Router:** Migrate to TanStack Router (see Routing API)

### From Vite (Basic)

1. **Add TanStack Router:** Install `@tanstack/react-router`
2. **Add Zustand:** Install `zustand` for state management
3. **Add React Query:** Install `@tanstack/react-query`
4. **Copy hooks:** Import hooks from `src/hooks/`
5. **Copy components:** Import UI components from `src/components/ui/`

---

## Advanced Patterns

### Optimistic Updates with React Query

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo: Todo) => apiClient.post('/todos', newTodo),
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update
      queryClient.setQueryData(['todos'], (old: Todo[]) => [...old, newTodo]);

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      queryClient.setQueryData(['todos'], context?.previousTodos);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return <button onClick={() => mutation.mutate({ title: 'New Todo' })}>Add Todo</button>;
}
```

---

### Form Handling with Zod

```typescript
import { z } from 'zod';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0] || '',
        password: fieldErrors.password?.[0] || '',
      });
      return;
    }

    // Valid form data
    apiClient.post('/auth/login', result.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={!!errors.email}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}

      <Input
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={!!errors.password}
      />
      {errors.password && <p className="text-red-500">{errors.password}</p>}

      <Button type="submit">Login</Button>
    </form>
  );
}
```

---

### Infinite Scrolling

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfinitePostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam = 1 }) => apiClient.get<PaginatedResponse<Post>>(`/posts?page=${pageParam}`),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.total ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });

  return (
    <div>
      {data?.pages.map((page) => page.data.map((post) => <PostCard key={post.id} post={post} />))}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

---

## Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui';

test('Button renders with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks';

test('useDebounce delays value update', async () => {
  const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
    initialProps: { value: 'initial' },
  });

  expect(result.current).toBe('initial');

  rerender({ value: 'updated' });
  expect(result.current).toBe('initial'); // Still initial (debounced)

  await act(() => new Promise((r) => setTimeout(r, 600)));
  expect(result.current).toBe('updated'); // Now updated
});
```

---

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

const ExpensiveList = memo(({ items }: { items: Item[] }) => {
  const sortedItems = useMemo(() => items.sort((a, b) => a.name.localeCompare(b.name)), [items]);

  const handleClick = useCallback((id: number) => {
    console.log('Clicked:', id);
  }, []);

  return sortedItems.map((item) => <div onClick={() => handleClick(item.id)}>{item.name}</div>);
});
```

---

## Security Best Practices

1. **Input Validation:** Use Zod schemas for all user inputs
2. **XSS Protection:** React escapes by default; avoid `dangerouslySetInnerHTML`
3. **CSRF:** Include CSRF tokens in POST/PUT/DELETE requests
4. **Authentication:** Store tokens securely (HttpOnly cookies preferred over localStorage)
5. **API Security:** Validate all API responses against expected schemas

---

## SemVer Commitment

This v1.0.0 release marks API stability. Future changes will follow semantic versioning:

- **MAJOR (2.0.0):** Breaking API changes
- **MINOR (1.1.0):** New features (backward compatible)
- **PATCH (1.0.1):** Bug fixes (backward compatible)

---

## Support

- **Documentation:** [Full docs](https://dcyfr.ai/docs/ai-react)
- **GitHub:** [Issues & Discussions](https://github.com/dcyfr/dcyfr-ai-react)
- **Email:** hello@dcyfr.ai

---

**Total Word Count:** 2,847 words  
**Last Updated:** February 8, 2026  
**License:** MIT
