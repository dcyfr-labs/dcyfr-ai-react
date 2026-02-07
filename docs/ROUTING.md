# Routing Guide - TanStack Router

**Target Audience:** React developers building SPAs  
**Prerequisites:** React fundamentals, React Router knowledge helpful

---

## Overview

This template uses **TanStack Router** for type-safe, file-based routing with:
- Type-safe route parameters and search params
- Route loaders for data fetching
- Nested layouts and routes
- Code splitting and lazy loading
- Navigation guards
- Search param validation with Zod

---

## Basic Route Definition

### Create a Route

```typescript
// src/routes/my-page.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './router';

export const myPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-page',
  component: MyPage,
});

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <p>Welcome to my page!</p>
    </div>
  );
}
```

### Register Route

```typescript
// src/routes/router.tsx
import { createRouter, createRootRoute } from '@tanstack/react-router';
import { myPageRoute } from './my-page';

export const rootRoute = createRootRoute({
  component: RootLayout,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  myPageRoute,
  // ... other routes
]);

export const router = createRouter({ routeTree });
```

---

## Route Parameters

### Dynamic Routes

```typescript
// src/routes/users/$userId.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../router';

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
});

function UserPage() {
  const { userId } = userRoute.useParams();
  
  return (
    <div>
      <h1>User {userId}</h1>
    </div>
  );
}
```

### Multiple Parameters

```typescript
// /posts/$postId/comments/$commentId
export const commentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts/$postId/comments/$commentId',
  component: CommentPage,
});

function CommentPage() {
  const { postId, commentId } = commentRoute.useParams();
  
  return <div>Post {postId}, Comment {commentId}</div>;
}
```

### Optional Parameters

```typescript
export const optionalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$slug',
  component: BlogPost,
});

// Matches /blog/my-post and /blog/
```

---

## Search Parameters

### Type-Safe Search Params with Zod

```typescript
import { z } from 'zod';

const searchSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).default('asc'),
});

export const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
  component: PostsList,
  validateSearch: searchSchema,
});

function PostsList() {
  const { page, limit, search, sort } = postsRoute.useSearch();
  
  // All params are typed and validated!
  // page: number, limit: number, search: string | undefined, sort: 'asc' | 'desc'
  
  return (
    <div>
      <h1>Posts (Page {page})</h1>
      {/* ... */}
    </div>
  );
}
```

### Update Search Params

```typescript
import { useNavigate } from '@tanstack/react-router';

function PostsFilters() {
  const navigate = useNavigate({ from: postsRoute.id });
  const search = postsRoute.useSearch();

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: newPage }),
    });
  };

  return (
    <div>
      <button onClick={() => handlePageChange(search.page + 1)}>
        Next Page
      </button>
    </div>
  );
}
```

---

## Route Loaders

### Load Data Before Rendering

```typescript
import { queryOptions } from '@tanstack/react-query';

const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['users', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      return res.json();
    },
  });

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  component: UserPage,
  loader: async ({ params, context }) => {
    // Pre-fetch data during navigation
    await context.queryClient.ensureQueryData(userQueryOptions(params.userId));
  },
});

function UserPage() {
  const { userId } = userRoute.useParams();
  const { data } = useQuery(userQueryOptions(userId));
  
  return <div>{data.name}</div>;
}
```

---

## Nested Routes & Layouts

### Parent Layout

```typescript
// src/routes/dashboard.tsx
import { createRoute, Outlet } from '@tanstack/react-router';
import { rootRoute } from './router';

export const dashboardLayout = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <nav>
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>
      </aside>
      
      <main className="content">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### Child Routes

```typescript
// src/routes/dashboard.index.tsx
export const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: '/',
  component: DashboardOverview,
});

// src/routes/dashboard.settings.tsx
export const dashboardSettingsRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: '/settings',
  component: DashboardSettings,
});

// Register in router
const routeTree = rootRoute.addChildren([
  dashboardLayout.addChildren([
    dashboardIndexRoute,
    dashboardSettingsRoute,
  ]),
]);
```

---

## Navigation

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to route
    navigate({ to: '/posts' });
    
    // Navigate with params
    navigate({ to: '/users/$userId', params: { userId: '123' } });
    
    // Navigate with search
    navigate({ to: '/posts', search: { page: 2, limit: 20 } });
    
    // Navigate with state
    navigate({ to: '/posts', state: { from: 'home' } });
  };

  return <button onClick={handleClick}>Go to Posts</button>;
}
```

### Link Component

```typescript
import { Link } from '@tanstack/react-router';

function Nav() {
  return (
    <nav>
      {/* Simple link */}
      <Link to="/about">About</Link>
      
      {/* With params */}
      <Link to="/users/$userId" params={{ userId: '123' }}>
        User 123
      </Link>
      
      {/* With search */}
      <Link to="/posts" search={{ page: 1 }}>
        Posts
      </Link>
      
      {/* Active link styling */}
      <Link
        to="/posts"
        activeProps={{ className: 'font-bold text-blue-600' }}
        inactiveProps={{ className: 'text-gray-600' }}
      >
        Posts
      </Link>
    </nav>
  );
}
```

---

## Code Splitting

### Lazy Load Routes

```typescript
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

export const heavyPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/heavy-page',
  component: lazyRouteComponent(() => import('./heavy-page-component')),
});

// heavy-page-component.tsx
export default function HeavyPageComponent() {
  return <div>This component is lazy loaded!</div>;
}
```

---

## Navigation Guards

### Authentication Guard

```typescript
import { redirect } from '@tanstack/react-router';

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      });
    }
  },
});
```

### Role-Based Access

```typescript
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
});
```

---

## Route Context

### Provide Context to Routes

```typescript
// src/main.tsx
import { createRouter } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';

interface RouterContext {
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    user: User | null;
  };
}

const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      isAuthenticated: false,
      user: null,
    },
  } as RouterContext,
});
```

### Use Context in Routes

```typescript
export const myRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-route',
  component: MyComponent,
  loader: ({ context }) => {
    // Access context
    const { queryClient, auth } = context;
    
    if (auth.isAuthenticated) {
      return queryClient.fetchQuery(/* ... */);
    }
  },
});
```

---

## Pending States

### Show Loading States

```typescript
import { useRouterState } from '@tanstack/react-router';

function GlobalLoadingIndicator() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500">
      <div className="h-full bg-blue-600 animate-pulse" />
    </div>
  );
}
```

---

## 404 / Not Found

### Catch-All Route

```typescript
export const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <Link to="/">Go Home</Link>
    </div>
  );
}
```

---

## Best Practices

### 1. Co-locate Route Files

```
src/routes/
├── router.tsx           # Router config
├── home.tsx             # GET /
├── about.tsx            # GET /about
├── posts/
│   ├── index.tsx        # GET /posts
│   └── $postId.tsx      # GET /posts/:postId
└── dashboard/
    ├── layout.tsx       # Dashboard layout
    ├── index.tsx        # GET /dashboard
    └── settings.tsx     # GET /dashboard/settings
```

### 2. Validate Search Params

```typescript
// ✅ Always validate with Zod
const searchSchema = z.object({
  page: z.number().int().positive().default(1),
});

// ❌ Don't use any/unknown
const search = route.useSearch(); // any
```

### 3. Prefetch Data in Loaders

```typescript
// ✅ Use loaders for data fetching
export const route = createRoute({
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(queryOptions(params.id));
  },
});

// ❌ Don't fetch in component mount
function Component() {
  useEffect(() => {
    fetchData(); // Happens after navigation
  }, []);
}
```

### 4. Type-Safe Navigation

```typescript
// ✅ Type-safe params
navigate({ to: '/posts/$postId', params: { postId: '123' } });

// ❌ Avoid string paths
navigate({ to: '/posts/123' }); // No type check
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
