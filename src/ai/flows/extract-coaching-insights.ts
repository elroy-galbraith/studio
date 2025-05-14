'use server';
/**
 * @fileOverview Extracts key coaching insights from uploaded transcripts.
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
    .describe('The transcript of the coaching session.'),
});
export type ExtractCoachingInsightsInput = z.infer<typeof ExtractCoachingInsightsInputSchema>;

const ExtractCoachingInsightsOutputSchema = z.object({
  growthThemes: z.array(z.string()).describe('Key growth themes identified in the transcript.'),
  skillsToDevelop: z
    .array(z.string())
    .describe('Skills that the team member should develop based on the transcript.'),
  suggestedCoachingQuestions: z
    .array(z.string())
    .describe('Suggested coaching questions to ask the team member.'),
  actionItems: z.array(z.string()).describe('Action items for the team member.'),
});
export type ExtractCoachingInsightsOutput = z.infer<typeof ExtractCoachingInsightsOutputSchema>;

export async function extractCoachingInsights(input: ExtractCoachingInsightsInput): Promise<ExtractCoachingInsightsOutput> {
  return extractCoachingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractCoachingInsightsPrompt',
  input: {schema: ExtractCoachingInsightsInputSchema},
  output: {schema: ExtractCoachingInsightsOutputSchema},
  prompt: `You are an AI assistant designed to analyze coaching session transcripts and extract key insights.

  Based on the provided transcript, identify the following:

  - Key growth themes for the team member.
  - Skills that the team member should develop.
  - Suggested coaching questions to help the team member improve.
  - Action items for the team member.

  Transcript:
  {{transcript}}
  `,
});

const extractCoachingInsightsFlow = ai.defineFlow(
  {
    name: 'extractCoachingInsightsFlow',
    inputSchema: ExtractCoachingInsightsInputSchema,
    outputSchema: ExtractCoachingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
