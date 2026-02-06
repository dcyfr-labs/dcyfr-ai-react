# Contributing to @dcyfr/ai-react

## Development Setup

```bash
npm install
npm run dev
```

## Code Standards

- TypeScript strict mode
- ESLint for linting (`npm run lint`)
- Prettier for formatting
- All components must have barrel exports

## Testing

- Write tests for all components, hooks, stores, and services
- Use React Testing Library for component tests
- Use Vitest for unit tests
- Run `npm run test:run` before submitting changes

## Pull Requests

1. Create a feature branch
2. Make changes with tests
3. Ensure `npm run typecheck` passes
4. Ensure `npm run test:run` passes
5. Submit PR with clear description
