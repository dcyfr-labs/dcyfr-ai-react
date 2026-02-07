# Testing Guide - Vitest & React Testing Library

**Target Audience:** React developers writing maintainable tests  
**Prerequisites:** Basic testing concepts, React fundamentals

---

## Overview

This template uses:
- **Vitest** — Fast test runner with native ESM support
- **React Testing Library** — User-centric component testing
- **jsdom** — Browser environment simulation
- **@testing-library/user-event** — Realistic user interactions

**Philosophy:** Test behavior, not implementation. Write tests users would run.

---

## Test Structure

### Basic Component Test

```typescript
// src/components/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click Me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Querying Elements

### Recommended Query Priority

```typescript
// 1. getByRole - Best for accessibility
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { level: 1 });

// 2. getByLabelText - Forms
screen.getByLabelText(/email address/i);

// 3. getByPlaceholderText - Forms without labels
screen.getByPlaceholderText(/enter email/i);

// 4. getByText - Non-interactive elements
screen.getByText(/welcome to our app/i);

// 5. getByTestId - Last resort
screen.getByTestId('custom-element');
```

### Query Variants

```typescript
// getBy - Throws error if not found
const button = screen.getByRole('button');

// queryBy - Returns null if not found
const button = screen.queryByRole('button');
expect(button).not.toBeInTheDocument();

// findBy - Async, waits for element
const button = await screen.findByRole('button');

// getAllBy - Returns array
const buttons = screen.getAllByRole('button');
expect(buttons).toHaveLength(3);
```

---

## User Interactions

### userEvent (Preferred)

```typescript
import { userEvent } from '@testing-library/user-event';

it('handles form submission', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();
  render(<LoginForm onSubmit={handleSubmit} />);

  // Type in input
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');

  // Click button
  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'john@example.com',
    password: 'password123',
  });
});
```

### Common Interactions

```typescript
const user = userEvent.setup();

// Typing
await user.type(input, 'Hello World');
await user.clear(input);

// Clicking
await user.click(button);
await user.dblClick(button);

// Selecting
await user.selectOptions(select, 'option1');

// Keyboard
await user.keyboard('{Enter}');
await user.keyboard('{Control>}a{/Control}'); // Ctrl+A
```

---

## Async Testing

### Waiting for Elements

```typescript
import { waitFor } from '@testing-library/react';

it('displays data after loading', async () => {
  render(<UserProfile userId="123" />);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  // Check data is displayed
  expect(screen.getByText(/john doe/i)).toBeInTheDocument();
});
```

### findBy Queries (Built-in Waiting)

```typescript
it('displays success message', async () => {
  render(<Form />);
  
  await userEvent.setup().click(screen.getByRole('button', { name: /submit/i }));
  
  // findBy automatically waits (default 1000ms)
  const message = await screen.findByText(/success/i);
  expect(message).toBeInTheDocument();
});
```

---

## Mocking

### Mock Functions

```typescript
import { vi } from 'vitest';

it('calls callback with correct arguments', () => {
  const mockCallback = vi.fn();
  render(<Button onClick={mockCallback}>Click</Button>);
  
  userEvent.setup().click(screen.getByRole('button'));
  
  expect(mockCallback).toHaveBeenCalledTimes(1);
  expect(mockCallback).toHaveBeenCalledWith(expect.any(MouseEvent));
});
```

### Mock Modules

```typescript
// src/services/__mocks__/api-client.ts
export const apiClient = {
  get: vi.fn(),
  post: vi.fn(),
};

// In test file
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client');

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays user data', async () => {
    apiClient.get.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    render(<UserProfile userId="1" />);

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
    expect(apiClient.get).toHaveBeenCalledWith('/users/1', expect.any(Object));
  });
});
```

### Partial Mocks

```typescript
// Mock only specific exports
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    fetchData: vi.fn(), // Mock this
    // Other exports remain real
  };
});
```

---

## Testing Hooks

### Basic Hook Test

```typescript
// src/hooks/__tests__/use-counter.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../use-counter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });
});
```

### Hook with Props

```typescript
it('updates when props change', () => {
  const { result, rerender } = renderHook(
    ({ initialCount }) => useCounter(initialCount),
    { initialProps: { initialCount: 0 } }
  );

  expect(result.current.count).toBe(0);

  rerender({ initialCount: 10 });
  
  expect(result.current.count).toBe(10);
});
```

---

## Testing Zustand Stores

### Direct Store Testing

```typescript
// tests/stores/counter-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCounterStore } from '@/stores/counter-store';

describe('Counter Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCounterStore.setState({ count: 0 });
  });

  it('increments count', () => {
    const { increment } = useCounterStore.getState();
    
    increment();
    
    expect(useCounterStore.getState().count).toBe(1);
  });

  it('decrements count', () => {
    const { increment, decrement } = useCounterStore.getState();
    
    increment();
    increment();
    decrement();
    
    expect(useCounterStore.getState().count).toBe(1);
  });
});
```

### Testing Components Using Stores

```typescript
import { useCounterStore } from '@/stores/counter-store';

describe('CounterDisplay', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 });
  });

  it('displays current count', async () => {
    render(<CounterDisplay />);
    
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
    
    // Trigger store update
    act(() => {
      useCounterStore.getState().increment();
    });

    await waitFor(() => {
      expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing React Query

### Setup Wrapper

```typescript
// tests/utils/test-utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

### Testing Queries

```typescript
import { renderWithQueryClient } from '@/tests/utils/test-utils';
import { apiClient } from '@/services/api-client';

vi.mock('@/services/api-client');

describe('UserProfile with React Query', () => {
  it('displays user data', async () => {
    apiClient.get.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    renderWithQueryClient(<UserProfile userId="1" />);

    // Wait for query to resolve
    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
    expect(await screen.findByText(/john@example.com/i)).toBeInTheDocument();
  });

  it('handles loading state', () => {
    apiClient.get.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderWithQueryClient(<UserProfile userId="1" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    apiClient.get.mockRejectedValue(new Error('Failed to fetch'));

    renderWithQueryClient(<UserProfile userId="1" />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
```

### Testing Mutations

```typescript
it('creates user successfully', async () => {
  const user = userEvent.setup();
  apiClient.post.mockResolvedValue({
    id: 1,
    name: 'New User',
    email: 'new@example.com',
  });

  renderWithQueryClient(<CreateUserForm />);

  await user.type(screen.getByLabelText(/name/i), 'New User');
  await user.type(screen.getByLabelText(/email/i), 'new@example.com');
  await user.click(screen.getByRole('button', { name: /create/i }));

  expect(await screen.findByText(/user created/i)).toBeInTheDocument();
  expect(apiClient.post).toHaveBeenCalledWith(
    '/users',
    { name: 'New User', email: 'new@example.com' },
    expect.any(Object)
  );
});
```

---

## Testing Routing

### With Router Provider

```typescript
// tests/utils/test-utils.tsx
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '@/routes/router';

export function renderWithRouter(ui: React.ReactElement, { initialUrl = '/' } = {}) {
  const history = createMemoryHistory({ initialEntries: [initialUrl] });
  const router = createRouter({ routeTree, history });

  return render(<RouterProvider router={router} />);
}
```

### Testing Navigation

```typescript
it('navigates to user page when clicking link', async () => {
  const user = userEvent.setup();
  renderWithRouter(<HomePage />);

  const link = screen.getByRole('link', { name: /view profile/i });
  await user.click(link);

  expect(await screen.findByText(/user profile/i)).toBeInTheDocument();
});
```

---

## Snapshot Testing

### Component Snapshots

```typescript
it('matches snapshot', () => {
  const { container } = render(<Button variant="primary">Click Me</Button>);
  
  expect(container.firstChild).toMatchSnapshot();
});
```

### Inline Snapshots

```typescript
it('generates correct className', () => {
  const { container } = render(<Button variant="primary" size="lg">Click</Button>);
  
  expect(container.firstChild).toMatchInlineSnapshot(`
    <button
      class="px-6 py-3 text-base bg-blue-600 text-white rounded-md hover:bg-blue-700"
      type="button"
    >
      Click
    </button>
  `);
});
```

---

## Coverage

### Run Coverage

```bash
npm run test:coverage
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ GOOD - Tests user behavior
it('submits form when clicking submit button', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(await screen.findByText(/success/i)).toBeInTheDocument();
});

// ❌ BAD - Tests implementation details
it('calls handleSubmit function', () => {
  const handleSubmit = vi.fn();
  render(<LoginForm handleSubmit={handleSubmit} />);
  
  // Testing internal function call
  instance.handleSubmit();
  expect(handleSubmit).toHaveBeenCalled();
});
```

### 2. Use Semantic Queries

```typescript
// ✅ GOOD - Accessible query
screen.getByRole('button', { name: /submit/i });

// ❌ BAD - Implementation detail
screen.getByClassName('submit-button');
```

### 3. Avoid Testing Library Internals

```typescript
// ✅ GOOD - Test output
expect(screen.getByText(/hello world/i)).toBeInTheDocument();

// ❌ BAD - Test state
expect(component.state.message).toBe('Hello World');
```

### 4. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatic cleanup
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 5. Use Realistic User Interactions

```typescript
// ✅ GOOD - User event API
const user = userEvent.setup();
await user.click(button);

// ❌ BAD - fireEvent (less realistic)
import { fireEvent } from '@testing-library/react';
fireEvent.click(button);
```

### 6. Avoid waitFor for Everything

```typescript
// ✅ GOOD - Use findBy
const element = await screen.findByText(/loaded/i);

// ❌ BAD - Unnecessary waitFor
await waitFor(() => {
  expect(screen.getByText(/loaded/i)).toBeInTheDocument();
});
```

---

## Common Patterns

### Testing Forms

```typescript
it('validates required fields', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```typescript
it('shows error message when error occurs', async () => {
  apiClient.get.mockRejectedValue(new Error('Network error'));
  
  renderWithQueryClient(<UserProfile userId="1" />);

  expect(await screen.findByText(/error/i)).toBeInTheDocument();
  expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
});
```

### Testing Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<Button>Click Me</Button>);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

**Last Updated:** February 7, 2026  
**Version:** 1.0.0
