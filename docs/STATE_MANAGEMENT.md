# State Management Guide - Zustand & React Query

**Target Audience:** React developers managing client and server state  
**Prerequisites:** React hooks knowledge, async/await familiarity

---

## Overview

This template uses a **hybrid state management approach**:
- **Zustand** — Client-side state (theme, UI, local data)
- **TanStack React Query** — Server state (API data, caching, synchronization)

**Philosophy:** Keep server state separate from client state. Use the right tool for each job.

---

## Zustand for Client State

### Basic Store

```typescript
// src/stores/counter-store.ts
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### Use in Components

```typescript
import { useCounterStore } from '@/stores/counter-store';

function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### Performance: Selective Subscriptions

```typescript
// ✅ GOOD - Only re-renders when count changes
function CountDisplay() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}

// ❌ BAD - Re-renders on ANY state change
function CountDisplay() {
  const { count } = useCounterStore();
  return <div>{count}</div>;
}
```

---

## Advanced Zustand Patterns

### Persist to LocalStorage

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Immer for Immutable Updates

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TodoState {
  todos: Array<{ id: string; text: string; done: boolean }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: crypto.randomUUID(), text, done: false });
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) {
          todo.done = !todo.done;
        }
      }),
  }))
);
```

### Slices Pattern (Large Stores)

```typescript
// src/stores/user-slice.ts
interface UserSlice {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
});

// src/stores/settings-slice.ts
interface SettingsSlice {
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
}

export const createSettingsSlice = (set: any): SettingsSlice => ({
  notifications: true,
  setNotifications: (enabled) => set({ notifications: enabled }),
});

// src/stores/app-store.ts
import { create } from 'zustand';

type AppState = UserSlice & SettingsSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createUserSlice(...a),
  ...createSettingsSlice(...a),
}));
```

---

## React Query for Server State

### Setup

```typescript
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Basic Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`/users/${userId}`, userSchema),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.email}</p>
    </div>
  );
}
```

### Query Options Pattern

```typescript
// src/queries/user-queries.ts
import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

export const userQueries = {
  all: () => ['users'] as const,
  lists: () => [...userQueries.all(), 'list'] as const,
  list: (filters: UserFilters) =>
    queryOptions({
      queryKey: [...userQueries.lists(), filters],
      queryFn: () => apiClient.get('/users', usersSchema, { params: filters }),
    }),
  details: () => [...userQueries.all(), 'detail'] as const,
  detail: (id: string) =>
    queryOptions({
      queryKey: [...userQueries.details(), id],
      queryFn: () => apiClient.get(`/users/${id}`, userSchema),
    }),
};

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data } = useQuery(userQueries.detail(userId));
  return <div>{data.name}</div>;
}
```

---

## Mutations

### Basic Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateUserForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser: InsertUser) =>
      apiClient.post('/users', newUser, userSchema),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    mutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && <div>Error: {mutation.error.message}</div>}
    </form>
  );
}
```

### Optimistic Updates

```typescript
const updateUserMutation = useMutation({
  mutationFn: (user: UpdateUser) =>
    apiClient.patch(`/users/${user.id}`, user, userSchema),
  onMutate: async (updatedUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users', updatedUser.id] });

    // Snapshot previous value
    const previousUser = queryClient.getQueryData(['users', updatedUser.id]);

    // Optimistically update
    queryClient.setQueryData(['users', updatedUser.id], updatedUser);

    // Return context with snapshot
    return { previousUser };
  },
  onError: (err, updatedUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['users', updatedUser.id], context?.previousUser);
  },
  onSettled: (data, error, variables) => {
    // Refetch to sync with server
    queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
  },
});
```

---

## Pagination

### Offset-Based Pagination

```typescript
function UsersList() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, limit: 10 }],
    queryFn: () =>
      apiClient.get('/users', paginatedUsersSchema, {
        params: { page, limit: 10 },
      }),
  });

  return (
    <div>
      {data?.items.map((user) => <UserCard key={user.id} user={user} />)}
      
      <div>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
```

### Infinite Queries (Cursor)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfinitePostsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }: any) =>
      apiClient.get('/posts', postsSchema, {
        params: { cursor: pageParam, limit: 20 },
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ))}
      
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Background Refetching

### Auto-Refetch on Interval

```typescript
function LiveDashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.get('/dashboard/stats', statsSchema),
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return <div>Active Users: {data.activeUsers}</div>;
}
```

### Refetch on Window Focus

```typescript
const { data } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => apiClient.get('/notifications', notificationsSchema),
  refetchOnWindowFocus: true, // Refetch when user returns to tab
});
```

---

## Cache Management

### Invalidate Queries

```typescript
const queryClient = useQueryClient();

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: ['users'] });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: ['users', userId] });

// Invalidate and refetch immediately
queryClient.invalidateQueries({
  queryKey: ['users'],
  refetchType: 'active',
});
```

### Manually Set Cache

```typescript
// Set query data manually
queryClient.setQueryData(['users', '123'], {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
});

// Update existing data
queryClient.setQueryData(['users', '123'], (old: User | undefined) => {
  if (!old) return old;
  return { ...old, name: 'Jane Doe' };
});
```

### Prefetch Data

```typescript
// Prefetch on hover (route loaders)
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`/users/${userId}`, userSchema),
  });
};

return (
  <Link to={`/users/${userId}`} onMouseEnter={handleMouseEnter}>
    View User
  </Link>
);
```

---

## Dependent Queries

### Sequential Queries

```typescript
function UserPosts({ userId }: { userId: string }) {
  // First query: Get user
  const { data: user } = useQuery({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`/users/${userId}`, userSchema),
  });

  // Second query: Get posts (only runs when user exists)
  const { data: posts } = useQuery({
    queryKey: ['posts', { authorId: user?.id }],
    queryFn: () =>
      apiClient.get('/posts', postsSchema, {
        params: { authorId: user!.id },
      }),
    enabled: !!user, // Only run when user is loaded
  });

  return (
    <div>
      <h2>{user?.name}'s Posts</h2>
      {posts?.items.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
```

---

## Combining Zustand + React Query

### Authentication State

```typescript
// src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);

// src/hooks/use-login.ts
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials, loginResponseSchema),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}

// Usage
function LoginForm() {
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email: '...', password: '...' });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Best Practices

### 1. Use Query Keys Consistently

```typescript
// ✅ GOOD - Hierarchical keys
const queryKey = ['users', 'list', { page: 1, limit: 10 }];

// ❌ BAD - Inconsistent structure
const queryKey = ['getUsersList', 1, 10];
```

### 2. Separate Client & Server State

```typescript
// ✅ GOOD - Server state in React Query
const { data } = useQuery(userQueries.detail(userId));

// ✅ GOOD - Client state in Zustand
const theme = useThemeStore((state) => state.theme);

// ❌ BAD - Server state in Zustand
const users = useStore((state) => state.users); // Should use React Query
```

### 3. Handle Loading & Error States

```typescript
// ✅ GOOD - Explicit handling
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <div>{data.name}</div>;

// ❌ BAD - Assuming data exists
return <div>{data.name}</div>; // TypeError if loading/error
```

### 4. Use Selective Subscriptions (Zustand)

```typescript
// ✅ GOOD - Only re-renders when count changes
const count = useStore((state) => state.count);

// ❌ BAD - Re-renders on any state change
const { count } = useStore();
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
