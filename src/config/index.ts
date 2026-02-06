/**
 * Application configuration
 */
export const config = {
  app: {
    name: 'DCYFR React App',
    description: 'Production-ready React SPA template',
    version: '0.1.0',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 10_000,
  },
} as const;
