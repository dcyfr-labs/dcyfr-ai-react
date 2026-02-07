/**
 * Custom React Hooks - Reusable Hook Patterns
 * 
 * Demonstrates common custom hooks for:
 * - Form management with validation
 * - Debouncing for search/input
 * - LocalStorage persistence
 * - Media queries for responsive design
 * - Click outside detection for modals
 * - Async operations with loading states
 * - Intersection Observer for lazy loading
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// =============================================================================
// FORM MANAGEMENT
// =============================================================================

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FormValues = Record<string, any>;

type FormErrors<T extends FormValues> = {
  [K in keyof T]?: string;
};

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  validationRules?: {
    [K in keyof T]?: ValidationRule<T[K]>[];
  };
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends FormValues>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate on blur
    if (validationRules?.[name]) {
      const value = values[name];
      const rules = validationRules[name]!;
      
      for (const rule of rules) {
        if (!rule.validate(value)) {
          setErrors((prev) => ({ ...prev, [name]: rule.message }));
          break;
        }
      }
    }
  }, [validationRules, values]);

  const validate = useCallback(() => {
    if (!validationRules) return true;

    const newErrors: FormErrors<T> = {};
    let isValid = true;

    for (const name in validationRules) {
      const value = values[name];
      const rules = validationRules[name]!;

      for (const rule of rules) {
        if (!rule.validate(value)) {
          newErrors[name] = rule.message;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, values]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}

// =============================================================================
// DEBOUNCE HOOK
// =============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// LOCAL STORAGE HOOK
// =============================================================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// =============================================================================
// MEDIA QUERY HOOK
// =============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// =============================================================================
// CLICK OUTSIDE HOOK
// =============================================================================

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// =============================================================================
// ASYNC OPERATION HOOK
// =============================================================================

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isCancelled = false;

    setState({ data: null, error: null, isLoading: true });

    asyncFunction()
      .then((data) => {
        if (!isCancelled) {
          setState({ data, error: null, isLoading: false });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setState({ data: null, error, isLoading: false });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return state;
}

// =============================================================================
// INTERSECTION OBSERVER HOOK
// =============================================================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
}

// =============================================================================
// PREVIOUS VALUE HOOK
// =============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// =============================================================================
// TOGGLE HOOK
// =============================================================================

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}

// =============================================================================
// EXAMPLE USAGE
// =============================================================================

// Example 1: Form with validation
export function LoginFormExample() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: [
        {
          validate: (value) => value.length > 0,
          message: 'Email is required',
        },
        {
          validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          message: 'Invalid email format',
        },
      ],
      password: [
        {
          validate: (value) => value.length > 0,
          message: 'Password is required',
        },
        {
          validate: (value) => value.length >= 8,
          message: 'Password must be at least 8 characters',
        },
      ],
    },
    onSubmit: async (values) => {
      console.log('Submitting:', values);
      // API call here
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          type="email"
          value={form.values.email}
          onChange={(e) => form.handleChange('email', e.target.value)}
          onBlur={() => form.handleBlur('email')}
          placeholder="Email"
        />
        {form.touched.email && form.errors.email && (
          <p className="error">{form.errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          value={form.values.password}
          onChange={(e) => form.handleChange('password', e.target.value)}
          onBlur={() => form.handleBlur('password')}
          placeholder="Password"
        />
        {form.touched.password && form.errors.password && (
          <p className="error">{form.errors.password}</p>
        )}
      </div>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// Example 2: Search with debounce
export function SearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      console.log('Searching for:', debouncedSearchTerm);
      // Perform search API call
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}

// Example 3: Theme persistence with localStorage
export function ThemeToggleExample() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}

// Example 4: Responsive layout with media query
export function ResponsiveLayoutExample() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? (
        <p>Mobile view</p>
      ) : (
        <p>Desktop view</p>
      )}
    </div>
  );
}

// Example 5: Modal with click outside to close
export function ModalExample() {
  const { value: isOpen, setFalse: close, setTrue: open } = useToggle();
  const modalRef = useClickOutside<HTMLDivElement>(close);

  return (
    <>
      <button onClick={open}>Open Modal</button>
      
      {isOpen && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal-content">
            <h2>Modal Title</h2>
            <p>Click outside to close</p>
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

// Example 6: Lazy load image on scroll
export function LazyImageExample() {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {isIntersecting ? (
        <img src="https://via.placeholder.com/600" alt="Lazy loaded" />
      ) : (
        <div style={{ height: 400, background: '#eee' }}>Loading...</div>
      )}
    </div>
  );
}
