import { Sparkles } from 'lucide-react';
import type { SVGProps } from 'react';

export function CoachLoopLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <Sparkles className="h-8 w-8 text-primary" {...props} />
  );
}
