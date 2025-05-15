import { CoachLoopLogo } from '@/components/coach-loop-logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <CoachLoopLogo />
        <h1 className="text-xl font-semibold text-foreground">CoachLoop</h1>
        <nav className="ml-auto flex gap-4">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}
