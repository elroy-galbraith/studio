
'use server';
import { extractCoachingInsights, type ExtractCoachingInsightsInput } from '@/ai/flows/extract-coaching-insights';
import { z } from 'zod';
import type { CoachingSessionResult, FormState } from '@/types'; // Updated import
import { transcriptFormInitialState } from '@/types'; // Updated import

const FormSchema = z.object({
  transcript: z.string().min(10, "Transcript must be at least 10 characters long."),
  teamMemberName: z.string().min(1, "Team member name cannot be empty."),
  sessionDate: z.string().min(1, "Session date cannot be empty."), // ISO string
});


export async function processTranscriptAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    transcript: formData.get('transcript'),
    teamMemberName: formData.get('teamMemberName'),
    sessionDate: formData.get('sessionDate'),
  });

  if (!validatedFields.success) {
    return {
      message: "Invalid form data. Please check the fields and try again.",
      issues: validatedFields.error.flatten().fieldErrors ?
        Object.values(validatedFields.error.flatten().fieldErrors).flat() :
        ["Unknown validation error. Please ensure all fields are filled correctly."],
      timestamp: Date.now(),
    };
  }

  const { transcript, teamMemberName, sessionDate } = validatedFields.data;

  try {
    const insightsInput: ExtractCoachingInsightsInput = { transcript };
    // console.log("Sending to AI:", insightsInput); // For debugging
    const insightsOutput = await extractCoachingInsights(insightsInput);
    // console.log("Received from AI:", insightsOutput); // For debugging

    if (!insightsOutput || Object.keys(insightsOutput).length === 0) {
        return {
            message: "AI processing returned no insights. The transcript might be too short or unclear.",
            timestamp: Date.now(),
        };
    }
    
    return {
      message: "Transcript processed successfully!",
      data: {
        ...insightsOutput,
        teamMemberName,
        sessionDate,
        transcript,
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error processing transcript:", error);
    // Check if error is an object and has a message property
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      message: `Failed to process transcript: ${errorMessage}. Please try again.`,
      timestamp: Date.now(),
    };
  }
}

// transcriptFormInitialState is now imported from @/types
// FormState type is now imported from @/types
