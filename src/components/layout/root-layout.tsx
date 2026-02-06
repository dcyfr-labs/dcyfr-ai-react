/**
 * Root layout with navigation and footer
 */
import { Outlet, Link, useMatchRoute } from '@tanstack/react-router';

const navLinks = [
  { to: '/' as const, label: 'Home' },
  { to: '/about' as const, label: 'About' },
  { to: '/examples' as const, label: 'Examples' },
];

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const matchRoute = useMatchRoute();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-lg">DCYFR</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {navLinks.map((link) => {
            const isActive = matchRoute({ to: link.to, fuzzy: link.to !== '/' });
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors hover:text-foreground/80 ${
                  isActive ? 'text-foreground font-medium' : 'text-foreground/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        Built with <a href="https://www.dcyfr.ai" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">DCYFR</a> React Template
      </div>
    </footer>
  );
}
