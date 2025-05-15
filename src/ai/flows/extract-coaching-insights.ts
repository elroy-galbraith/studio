
'use server';
/**
 * @fileOverview Extracts key coaching insights from uploaded transcripts, potentially considering historical context.
 *
 * - extractCoachingInsights - A function that handles the extraction of coaching insights.
 * - ExtractCoachingInsightsInput - The input type for the extractCoachingInsights function.
 * - ExtractCoachingInsightsOutput - The return type for the extractCoachingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCoachingInsightsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript of the current coaching session.'),
  historicalSummary: z
    .string()
    .optional()
    .describe('A summary of key points from recent previous sessions with this team member, if available.'),
});
// Explicitly type the input based on the schema for the flow definition
export type ExtractCoachingInsightsFlowInput = z.infer<typeof ExtractCoachingInsightsInputSchema>;


const ExtractCoachingInsightsOutputSchema = z.object({
  growthThemes: z.array(z.string()).describe('Key growth themes identified in the transcript, considering past progress.'),
  skillsToDevelop: z
    .array(z.string())
    .describe('Skills that the team member should develop, considering past recommendations and current needs.'),
  suggestedCoachingQuestions: z
    .array(z.string())
    .describe('Suggested coaching questions to ask the team member, potentially building on previous discussions.'),
  actionItems: z.array(z.string()).describe('Action items for the team member based on the current session and historical context.'),
});
export type ExtractCoachingInsightsOutput = z.infer<typeof ExtractCoachingInsightsOutputSchema>;

// The publicly exported function should align with the type defined in src/types/index.ts for broader app use
// This might seem redundant but helps decouple the flow's internal schema from the type used in actions.ts
// However, to avoid confusion, we'll ensure that ExtractCoachingInsightsInput in types/index.ts is compatible.
// The input type for this exported function will be the one from src/types/index.ts
// which already includes transcript and optional historicalSummary.
import type { ExtractCoachingInsightsInput as AppExtractCoachingInsightsInput } from '@/types';

export async function extractCoachingInsights(input: AppExtractCoachingInsightsInput): Promise<ExtractCoachingInsightsOutput> {
  // The input to the flow must match ExtractCoachingInsightsFlowInput
  const flowInput: ExtractCoachingInsightsFlowInput = {
    transcript: input.transcript,
    ...(input.historicalSummary && { historicalSummary: input.historicalSummary }),
  };
  return extractCoachingInsightsFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'extractCoachingInsightsPrompt',
  input: {schema: ExtractCoachingInsightsInputSchema}, // Use the flow-specific input schema here
  output: {schema: ExtractCoachingInsightsOutputSchema},
  prompt: `You are an AI assistant designed to analyze coaching session transcripts and extract key insights.
You need to help team members grow over time.

{{#if historicalSummary}}
Consider the following summary of key points from recent previous sessions with this team member:
--- HISTORICAL SUMMARY START ---
{{historicalSummary}}
--- HISTORICAL SUMMARY END ---
When generating your insights, reflect on this history. For example, if a skill was identified previously, note if there's progress or if it remains an area for development. If new themes emerge, consider how they relate to past discussions.
{{else}}
No summary of recent past sessions was provided. Base your analysis primarily on the current transcript.
{{/if}}

Based on the provided CURRENT transcript AND considering the historical summary (if provided), identify the following:

- Key growth themes for the team member.
- Skills that the team member should develop.
- Suggested coaching questions to help the team member improve.
- Action items for the team member.

Current Transcript:
{{transcript}}
  `,
});

const extractCoachingInsightsFlow = ai.defineFlow(
  {
    name: 'extractCoachingInsightsFlow',
    inputSchema: ExtractCoachingInsightsInputSchema, // Flow uses its specific input schema
    outputSchema: ExtractCoachingInsightsOutputSchema,
  },
  async (input: ExtractCoachingInsightsFlowInput) => { // Input here is ExtractCoachingInsightsFlowInput
    const {output} = await prompt(input);
    return output!;
  }
);

