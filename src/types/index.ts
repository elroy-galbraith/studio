import type { ExtractCoachingInsightsOutput } from '@/ai/flows/extract-coaching-insights';

export type TeamMember = {
  id: string;
  name: string;
};

export type ActionItemStatus = 'open' | 'in progress' | 'done';

// Represents an action item string from AI, enhanced on client-side
export type ClientActionItem = {
  id: string; 
  description: string; 
  status: ActionItemStatus;
  dueDate?: Date;
  teamMemberName: string; 
};

export type CoachingSessionResult = ExtractCoachingInsightsOutput & {
  teamMemberName: string;
  sessionDate: string; // ISO string
  transcript: string;
};

// Form state for the transcript submission
export type FormState = {
  message?: string;
  issues?: string[];
  data?: CoachingSessionResult;
  timestamp?: number; // To help trigger re-renders if data object is the same
};

// Initial state for the transcript form
export const transcriptFormInitialState: FormState = {
  message: undefined,
  issues: undefined,
  data: undefined,
  timestamp: undefined,
};
