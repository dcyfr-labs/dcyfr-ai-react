/**
 * 404 Not Found page
 */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
      <a
        href="/"
        className="mt-8 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Go home
      </a>
    </div>
  );
}
