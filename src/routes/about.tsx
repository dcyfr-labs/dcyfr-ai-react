/**
 * About page
 */
export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">About This Template</h1>

      <div className="prose">
        <p className="text-muted-foreground leading-relaxed">
          This is a production-ready React SPA template built with modern best practices.
          It provides a solid foundation for building single-page applications with TypeScript.
        </p>
      </div>

      <div className="space-y-6">
        <TechSection
          title="Frontend Framework"
          items={['React 19', 'TypeScript (strict mode)', 'Vite 6 (instant HMR)']}
        />
        <TechSection
          title="Routing"
          items={['TanStack Router', 'Type-safe routes', 'Nested layouts']}
        />
        <TechSection
          title="State Management"
          items={['Zustand (client state)', 'React Query (server state)', 'Zod (validation)']}
        />
        <TechSection
          title="Styling"
          items={['Tailwind CSS', 'CSS variables (light/dark)', 'Responsive design']}
        />
        <TechSection
          title="Testing"
          items={['Vitest', 'React Testing Library', 'User-event simulation']}
        />
      </div>
    </div>
  );
}

function TechSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="text-green-500">✓</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
