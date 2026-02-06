import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from '../components/layout/root-layout';
import { HomePage } from '../routes/home';
import { AboutPage } from '../routes/about';
import { ExamplesPage } from '../routes/examples';
import { NotFoundPage } from '../routes/not-found';

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

// Child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/examples',
  component: ExamplesPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, examplesRoute]);

// Create router instance
export const router = createRouter({ routeTree });

// Type-safe router declaration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
