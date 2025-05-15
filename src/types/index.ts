
import type { ExtractCoachingInsightsOutput as GenkitExtractCoachingInsightsOutput } from '@/ai/flows/extract-coaching-insights';

export type TeamMember = {
  id: string;
  name: string;
  createdAt?: Date; // Optional: Firestore timestamp converted to Date
};

export type ActionItemStatus = 'open' | 'in progress' | 'done';

// Represents an action item on the client and for storage
export type ClientActionItem = {
  id: string; // Unique ID for the action item
  description: string;
  status: ActionItemStatus;
  dueDate?: Date; // Stored as ISO string in Firestore, Date object on client
  teamMemberName: string; // Denormalized for context if needed, though primarily associated with session
};

// This is the input type for the Genkit flow
export interface ExtractCoachingInsightsInput extends GenkitExtractCoachingInsightsOutput {
  transcript: string;
  historicalSummary?: string;
}

// This is the result after AI processing and initial transformation within the server action
// It's what's saved to Firestore (actionItems will be ClientActionItem[]) and returned to the form
export type CoachingSessionResult = Omit<GenkitExtractCoachingInsightsOutput, 'actionItems'> & {
  id?: string; // Firestore document ID of the session, added after saving
  teamMemberName: string;
  sessionDate: string; // ISO string
  transcript: string;
  actionItems: ClientActionItem[]; // Transformed from string[] to ClientActionItem[]
};

// Represents a coaching session as stored and retrieved from Firestore
export interface CoachingSession {
  id: string; // Firestore document ID
  teamMemberId: string;
  teamMemberName: string;
  sessionDate: string; // ISO string
  transcript: string;
  growthThemes?: string[];
  skillsToDevelop?: string[];
  suggestedCoachingQuestions?: string[];
  actionItems?: ClientActionItem[]; // Now an array of rich objects
  createdAt: string; // ISO string from Firestore Timestamp
}

// Form state for the transcript submission
export type FormState = {
  message?: string;
  issues?: string[];
  data?: CoachingSessionResult; // This now contains ClientActionItem[] and the session ID
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
