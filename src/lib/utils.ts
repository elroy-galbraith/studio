import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import type { CoachingSession } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a concise summary string from past coaching sessions.
 * @param sessions - An array of past CoachingSession objects.
 * @returns A string summarizing key insights from past sessions, or null if no relevant insights.
 */
export function formatHistoricalContext(sessions: CoachingSession[]): string | null {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const contextParts: string[] = [];
  sessions.forEach(session => {
    const dateStr = format(new Date(session.sessionDate), 'yyyy-MM-dd');
    const parts: string[] = [];
    if (session.growthThemes && session.growthThemes.length > 0) {
      parts.push(`Growth Themes: ${session.growthThemes.join(', ')}`);
    }
    if (session.skillsToDevelop && session.skillsToDevelop.length > 0) {
      parts.push(`Skills to Develop: ${session.skillsToDevelop.join(', ')}`);
    }
    if (session.actionItems && session.actionItems.length > 0) {
      parts.push(`Previous Action Items: ${session.actionItems.join(', ')}`);
    }
    if (parts.length > 0) {
      contextParts.push(`On ${dateStr}: ${parts.join('; ')}.`);
    }
  });

  return contextParts.length > 0 ? contextParts.join('\n') : null;
}
