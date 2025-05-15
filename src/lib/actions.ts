
'use server';
import { extractCoachingInsights, type ExtractCoachingInsightsInput } from '@/ai/flows/extract-coaching-insights';
import { z } from 'zod';
import type { CoachingSessionResult, FormState, TeamMember, TeamMemberDetailsAndSessions, CoachingSession } from '@/types';
import { transcriptFormInitialState } from '@/types';
import { addTeamMember, getTeamMemberById, getTeamMembers } from '@/services/team-member-service';
import { addCoachingSession, getCoachingSessionsByTeamMemberId } from '@/services/coaching-session-service';


// Schema for the main form processing
const ProcessTranscriptFormSchema = z.object({
  transcript: z.string().min(10, "Transcript must be at least 10 characters long."),
  teamMemberId: z.string().min(1, "Team member selection is required."), // Can be an ID or 'new'
  newTeamMemberName: z.string().optional(),
  sessionDate: z.string().min(1, "Session date cannot be empty."), // ISO string
}).superRefine((data, ctx) => {
  if (data.teamMemberId === 'new' && (!data.newTeamMemberName || data.newTeamMemberName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New team member name is required when 'Add New' is selected.",
      path: ['newTeamMemberName'],
    });
  }
});


export async function processTranscriptAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const rawNewTeamMemberName = formData.get('newTeamMemberName');

  const validatedFields = ProcessTranscriptFormSchema.safeParse({
    transcript: formData.get('transcript'),
    teamMemberId: formData.get('teamMemberId'),
    newTeamMemberName: rawNewTeamMemberName === null ? undefined : String(rawNewTeamMemberName), // Coerce null to undefined, and ensure it's a string if not null/undefined
    sessionDate: formData.get('sessionDate'),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data. Please check the fields and try again.",
      issues: validatedFields.error.flatten().fieldErrors ?
        Object.values(validatedFields.error.flatten().fieldErrors).flat().concat(
          validatedFields.error.flatten().formErrors
        )
        : ["Unknown validation error. Please ensure all fields are filled correctly."],
      timestamp: Date.now(),
    };
  }

  const { transcript, teamMemberId, newTeamMemberName, sessionDate } = validatedFields.data;
  let actualTeamMemberName: string = '';
  let currentTeamMemberId: string = teamMemberId;

  try {
    if (teamMemberId === 'new' && newTeamMemberName) {
      const newMember = await addTeamMember(newTeamMemberName);
      actualTeamMemberName = newMember.name;
      currentTeamMemberId = newMember.id;
    } else if (teamMemberId !== 'new') {
      const existingMember = await getTeamMemberById(teamMemberId);
      if (existingMember) {
        actualTeamMemberName = existingMember.name;
      } else {
        return {
          message: `Selected team member with ID ${teamMemberId} not found.`,
          timestamp: Date.now(),
        };
      }
    } else {
         return {
          message: "Invalid team member selection.",
          timestamp: Date.now(),
        };
    }

    const insightsInput: ExtractCoachingInsightsInput = { transcript };
    const insightsOutput = await extractCoachingInsights(insightsInput);

    if (!insightsOutput || Object.keys(insightsOutput).length === 0) {
        return {
            message: "AI processing returned no insights. The transcript might be too short or unclear.",
            timestamp: Date.now(),
        };
    }

    const sessionResult: CoachingSessionResult = {
      ...insightsOutput,
      teamMemberName: actualTeamMemberName,
      sessionDate, // This is already an ISO string
      transcript,
    };

    // Save the coaching session to Firestore
    await addCoachingSession(sessionResult, currentTeamMemberId);

    return {
      message: "Transcript processed and session saved successfully!",
      data: sessionResult,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error processing transcript:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      message: `Failed to process transcript: ${errorMessage}. Please try again.`,
      timestamp: Date.now(),
    };
  }
}

/**
 * Server action to fetch all team members.
 * @returns A promise that resolves to an array of TeamMember objects.
 */
export async function fetchTeamMembersAction(): Promise<TeamMember[]> {
  try {
    return await getTeamMembers();
  } catch (error) {
    console.error("Error in fetchTeamMembersAction:", error);
    return [];
  }
}

/**
 * Server action to fetch a team member's details and all their coaching sessions.
 * @param teamMemberId - The ID of the team member.
 * @returns A promise that resolves to an object containing team member details and their sessions.
 */
export async function fetchTeamMemberDetailsAndSessionsAction(teamMemberId: string): Promise<TeamMemberDetailsAndSessions> {
  try {
    if (!teamMemberId) {
      // This case should ideally be caught by client-side validation or routing
      // but good to have a check.
      console.warn("fetchTeamMemberDetailsAndSessionsAction called with no teamMemberId");
      return { teamMember: null, sessions: [] };
    }
    const teamMember = await getTeamMemberById(teamMemberId);
    // If teamMember is null, the page will handle displaying "not found".
    
    const sessions = await getCoachingSessionsByTeamMemberId(teamMemberId);
    
    return { teamMember, sessions };
  } catch (error) {
    console.error(`Error in fetchTeamMemberDetailsAndSessionsAction for ID ${teamMemberId}:`, error);
    // Return a structure that the page can handle as an error state or empty state
    // Avoid throwing here so the page can render an error message gracefully.
    return { teamMember: null, sessions: [] };
  }
}
