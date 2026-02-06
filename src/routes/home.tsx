/**
 * Home page
 */
export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          DCYFR React Template
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Production-ready React SPA with TypeScript, Vite, TanStack Router, Zustand, and Tailwind CSS.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/examples"
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            View Examples
          </a>
          <a
            href="/about"
            className="text-sm font-semibold leading-6"
          >
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          title="Type-Safe Routing"
          description="TanStack Router with full TypeScript inference for params, search params, and route context."
        />
        <FeatureCard
          title="State Management"
          description="Zustand for client state and React Query for server state, with TypeScript generics."
        />
        <FeatureCard
          title="Modern Tooling"
          description="Vite for instant HMR, Vitest for testing, Tailwind CSS for styling, ESLint for quality."
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
