import { CoachLoopLogo } from '@/components/coach-loop-logo';

export function AppHeader() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <CoachLoopLogo />
        <h1 className="text-xl font-semibold text-foreground">CoachLoop</h1>
      </div>
    </header>
  );
}
