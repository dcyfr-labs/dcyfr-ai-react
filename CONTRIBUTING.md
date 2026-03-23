# Contributing to @dcyfr/ai-react

## Licensing & Contributions

By contributing to `@dcyfr/ai-react`, you agree that:

- Your contributions will be licensed under the project's MIT License
- You have the right to submit the contribution under this license
- You grant DCYFR Labs perpetual rights to use, modify, and distribute your contribution

### Trademark

Do not use "DCYFR" trademarks in ways that imply endorsement without permission. See [../TRADEMARK.md](../TRADEMARK.md) for usage guidelines.

**Questions?** Contact [licensing@dcyfr.ai](mailto:licensing@dcyfr.ai)

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
