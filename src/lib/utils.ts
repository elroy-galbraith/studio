import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';
import type { CoachingSession, ClientActionItem } from '@/types';

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
    // Check if actionItems exist and are ClientActionItem objects before trying to join descriptions
    if (session.actionItems && session.actionItems.length > 0) {
      const actionItemDescriptions = session.actionItems
        .map(item => (typeof item === 'string' ? item : item.description))
        .filter(desc => desc) // Filter out any undefined/null descriptions
        .join(', ');
      if (actionItemDescriptions) {
        parts.push(`Previous Action Items: ${actionItemDescriptions}`);
      }
    }
    if (parts.length > 0) {
      contextParts.push(`On ${dateStr}: ${parts.join('; ')}.`);
    }
  });

  return contextParts.length > 0 ? contextParts.join('\n') : null;
}

/**
 * Triggers a browser download for a given text content.
 * @param filename - The desired name for the downloaded file (e.g., "insights.txt").
 * @param content - The string content to be included in the file.
 */
export function downloadTextFile(filename: string, content: string): void {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
