
import type { ExtractCoachingInsightsOutput as GenkitExtractCoachingInsightsOutput } from '@/ai/flows/extract-coaching-insights';

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

// This is the direct output from the Genkit flow, which might include historicalSummary
export interface ExtractCoachingInsightsInput extends GenkitExtractCoachingInsightsOutput {
  transcript: string;
  historicalSummary?: string; // Added for historical context
}

// This is the result after processing, including team member name and session date,
// and it's also what's stored in Firestore (minus historicalSummary which is transient for the call)
export type CoachingSessionResult = GenkitExtractCoachingInsightsOutput & {
  teamMemberName: string;
  sessionDate: string; // ISO string
  transcript: string;
};

// Represents a coaching session as stored and retrieved from Firestore
export interface CoachingSession extends Omit<CoachingSessionResult, 'growthThemes' | 'skillsToDevelop' | 'suggestedCoachingQuestions' | 'actionItems'> {
  id: string; // Firestore document ID
  teamMemberId: string;
  // sessionDate is already an ISO string in CoachingSessionResult
  createdAt: string; // ISO string from Firestore Timestamp
  // Make insight fields optional as older records might not have them or they might be empty
  growthThemes?: string[];
  skillsToDevelop?: string[];
  suggestedCoachingQuestions?: string[];
  actionItems?: string[];
  transcript: string; // Ensure transcript is part of stored session
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

