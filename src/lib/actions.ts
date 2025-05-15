
'use server';
import { extractCoachingInsights } from '@/ai/flows/extract-coaching-insights';
import type { ExtractCoachingInsightsInput, CoachingSessionResult as AppCoachingSessionResult, ClientActionItem } from '@/types';
import { z } from 'zod';
import type { FormState, TeamMember, TeamMemberDetailsAndSessions } from '@/types';
import { transcriptFormInitialState } from '@/types'; // Keep this if other actions might use it, or define locally
import { addTeamMember, getTeamMemberById, getTeamMembers } from '@/services/team-member-service';
import { addCoachingSession, getCoachingSessionsByTeamMemberId, updateCoachingSessionActionItems as updateSessionActionItemsService } from '@/services/coaching-session-service';
import { formatHistoricalContext } from '@/lib/utils';


// Schema for the main form processing
const ProcessTranscriptFormSchema = z.object({
  transcript: z.string().min(10, "Transcript must be at least 10 characters long."),
  teamMemberId: z.string().min(1, "Team member selection is required."),
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
    newTeamMemberName: rawNewTeamMemberName === null ? undefined : String(rawNewTeamMemberName),
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
  let historicalSummary: string | null = null;

  try {
    if (teamMemberId === 'new' && newTeamMemberName) {
      const newMember = await addTeamMember(newTeamMemberName);
      actualTeamMemberName = newMember.name;
      currentTeamMemberId = newMember.id;
    } else if (teamMemberId !== 'new') {
      const existingMember = await getTeamMemberById(teamMemberId);
      if (existingMember) {
        actualTeamMemberName = existingMember.name;
        const pastSessions = await getCoachingSessionsByTeamMemberId(currentTeamMemberId, 3);
        historicalSummary = formatHistoricalContext(pastSessions);
      } else {
        return { message: `Selected team member with ID ${teamMemberId} not found.`, timestamp: Date.now() };
      }
    } else {
      return { message: "Invalid team member selection.", timestamp: Date.now() };
    }

    const insightsInput: ExtractCoachingInsightsInput = {
      transcript,
      ...(historicalSummary && { historicalSummary }),
    };

    const aiOutput = await extractCoachingInsights(insightsInput);

    if (!aiOutput || Object.keys(aiOutput).length === 0) {
      return { message: "AI processing returned no insights. The transcript might be too short or unclear.", timestamp: Date.now() };
    }

    // Transform string action items from AI into ClientActionItem objects
    const structuredActionItems: ClientActionItem[] = (aiOutput.actionItems || []).map(desc => ({
      id: crypto.randomUUID(), // Generate unique ID for each action item
      description: desc,
      status: 'open' as const,
      teamMemberName: actualTeamMemberName, // Add teamMemberName for client-side context
      // dueDate is initially undefined
    }));

    const sessionResult: AppCoachingSessionResult = {
      ...aiOutput,
      actionItems: structuredActionItems, // Use the structured action items
      teamMemberName: actualTeamMemberName,
      sessionDate,
      transcript,
    };

    const sessionId = await addCoachingSession(sessionResult, currentTeamMemberId);
    sessionResult.id = sessionId; // Add the Firestore session ID to the result

    return {
      message: "Transcript processed and session saved successfully!",
      data: sessionResult, // This now includes the session ID and structured action items
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error processing transcript:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { message: `Failed to process transcript: ${errorMessage}. Please try again.`, timestamp: Date.now() };
  }
}

export async function fetchTeamMembersAction(): Promise<TeamMember[]> {
  try {
    return await getTeamMembers();
  } catch (error) {
    console.error("Error in fetchTeamMembersAction:", error);
    return [];
  }
}

export async function fetchTeamMemberDetailsAndSessionsAction(teamMemberId: string): Promise<TeamMemberDetailsAndSessions> {
  try {
    if (!teamMemberId) {
      console.warn("fetchTeamMemberDetailsAndSessionsAction called with no teamMemberId");
      return { teamMember: null, sessions: [] };
    }
    const teamMember = await getTeamMemberById(teamMemberId);
    const sessions = await getCoachingSessionsByTeamMemberId(teamMemberId);
    return { teamMember, sessions };
  } catch (error) {
    console.error(`Error in fetchTeamMemberDetailsAndSessionsAction for ID ${teamMemberId}:`, error);
    return { teamMember: null, sessions: [] };
  }
}

export async function updateActionItemsAction(
  sessionId: string,
  actionItems: ClientActionItem[]
): Promise<{ success: boolean; message?: string }> {
  if (!sessionId) {
    return { success: false, message: "Session ID is required." };
  }
  if (!actionItems) {
    return { success: false, message: "Action items are required." };
  }

  try {
    await updateSessionActionItemsService(sessionId, actionItems);
    return { success: true, message: "Action items updated successfully." };
  } catch (error) {
    console.error("Error in updateActionItemsAction:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update action items.";
    return { success: false, message: errorMessage };
  }
}
