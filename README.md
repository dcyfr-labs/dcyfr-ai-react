# @dcyfr/ai-react

Production-ready React SPA starter template built with modern tooling and best practices.

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19 |
| **Language** | TypeScript | 5.7+ |
| **Bundler** | Vite | 6 |
| **Routing** | TanStack Router | 1.95+ |
| **Server State** | TanStack React Query | 5.62+ |
| **Client State** | Zustand | 5 |
| **Styling** | Tailwind CSS | 3.4 |
| **Validation** | Zod | 3.24+ |
| **Testing** | Vitest + React Testing Library | 2.1 / 16.1 |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run

# Type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server starts at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
dcyfr-ai-react/
├── index.html                  # HTML entry point
├── public/
│   └── favicon.svg             # App favicon
├── src/
│   ├── main.tsx                # Application entry (providers)
│   ├── config/
│   │   └── index.ts            # App configuration
│   ├── components/
│   │   ├── layout/
│   │   │   └── root-layout.tsx # App shell (navbar + footer)
│   │   └── ui/
│   │       ├── badge.tsx       # Badge component
│   │       ├── button.tsx      # Button with variants
│   │       ├── card.tsx        # Card container
│   │       ├── input.tsx       # Input with error state
│   │       └── spinner.tsx     # Loading spinner
│   ├── hooks/
│   │   ├── use-debounce.ts     # Debounce hook
│   │   ├── use-local-storage.ts# Local storage hook
│   │   └── use-media-query.ts  # Media query hook
│   ├── lib/
│   │   └── utils.ts            # cn() utility
│   ├── routes/
│   │   ├── router.tsx          # Route definitions
│   │   ├── home.tsx            # Home page
│   │   ├── about.tsx           # About page
│   │   ├── examples.tsx        # Examples (counter + form)
│   │   └── not-found.tsx       # 404 page
│   ├── services/
│   │   └── api-client.ts       # Typed API client
│   ├── stores/
│   │   ├── counter-store.ts    # Counter (example)
│   │   └── theme-store.ts      # Theme (dark/light/system)
│   └── styles/
│       └── globals.css         # Tailwind + CSS variables
└── tests/
    ├── setup.ts                # Test setup (jest-dom)
    ├── components/
    │   ├── badge.test.tsx
    │   ├── button.test.tsx
    │   ├── card.test.tsx
    │   └── input.test.tsx
    ├── hooks/
    │   └── use-debounce.test.ts
    ├── services/
    │   └── api-client.test.ts
    └── stores/
        ├── counter-store.test.ts
        └── theme-store.test.ts
```

## Key Patterns

### Type-Safe Routing (TanStack Router)

```typescript
import { createRoute } from '@tanstack/react-router';

const myRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-page',
  component: MyPage,
});
```

### State Management (Zustand)

```typescript
import { create } from 'zustand';

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>((set) => ({
  value: '',
  setValue: (v) => set({ value: v }),
}));
```

### Typed API Client

```typescript
import { apiClient } from '@/services/api-client';
import { z } from 'zod';

const UserSchema = z.object({ id: z.number(), name: z.string() });

const user = await apiClient.get('/users/1', UserSchema);
// user is typed as { id: number; name: string }
```

### UI Components

All components support variant props and `className` merging via `cn()`:

```tsx
import { Button, Card, Badge } from '@/components/ui';

<Button variant="primary" size="lg">Click Me</Button>
<Card title="My Card">Content here</Card>
<Badge variant="secondary">Status</Badge>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` |

Copy `.env.example` to `.env` and configure as needed.

## Testing

```bash
# Run all tests
npm run test:run

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Tests use **Vitest** with **React Testing Library** and **jsdom** environment.

## Building

```bash
# Production build
npm run build

# Preview the build
npm run preview
```

Output is generated in `dist/`.

## License

MIT - See [LICENSE](LICENSE) for details.
