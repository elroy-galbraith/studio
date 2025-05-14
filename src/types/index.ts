
import type { ExtractCoachingInsightsOutput } from '@/ai/flows/extract-coaching-insights';

export type TeamMember = {
  id: string;
  name: string;
  createdAt?: Date; // Optional: Firestore timestamp converted to Date
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

// Represents a coaching session as stored and retrieved from Firestore
export interface CoachingSession extends CoachingSessionResult {
  id: string; // Firestore document ID
  teamMemberId: string;
  // sessionDate is already an ISO string in CoachingSessionResult
  createdAt: string; // ISO string from Firestore Timestamp
}

// Form state for the transcript submission
export type FormState = {
  message?: string;
  issues?: string[];
  data?: CoachingSessionResult; // This is the data returned to the form after AI processing
  timestamp?: number;
};

// Initial state for the transcript form
export const transcriptFormInitialState: FormState = {
  message: undefined,
  issues: undefined,
  data: undefined,
  timestamp: undefined,
};

export type TeamMemberDetailsAndSessions = {
  teamMember: TeamMember | null;
  sessions: CoachingSession[];
};
