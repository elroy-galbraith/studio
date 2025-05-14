// @/services/coaching-session-service.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { CoachingSessionResult } from '@/types';

const COACHING_SESSIONS_COLLECTION = 'coachingSessions';

export interface CoachingSessionForStorage extends Omit<CoachingSessionResult, 'sessionDate'> {
  teamMemberId: string;
  sessionDate: Timestamp; // Stored as Firestore Timestamp
  createdAt: Timestamp; // Firestore server timestamp
}

/**
 * Adds a new coaching session to Firestore.
 * @param sessionData - The coaching session data to store.
 * @param teamMemberId - The ID of the team member associated with this session.
 * @returns The ID of the newly created coaching session document.
 */
export async function addCoachingSession(
  sessionData: CoachingSessionResult,
  teamMemberId: string
): Promise<string> {
  if (!teamMemberId || typeof teamMemberId !== 'string' || teamMemberId.trim() === '') {
    throw new Error('Team member ID must be a non-empty string.');
  }
  if (!sessionData) {
    throw new Error('Session data cannot be empty.');
  }

  try {
    const docRef = await addDoc(collection(db, COACHING_SESSIONS_COLLECTION), {
      teamMemberId: teamMemberId.trim(),
      teamMemberName: sessionData.teamMemberName,
      sessionDate: Timestamp.fromDate(new Date(sessionData.sessionDate)), // Convert ISO string to Firestore Timestamp
      transcript: sessionData.transcript,
      growthThemes: sessionData.growthThemes || [],
      skillsToDevelop: sessionData.skillsToDevelop || [],
      suggestedCoachingQuestions: sessionData.suggestedCoachingQuestions || [],
      actionItems: sessionData.actionItems || [], // These are the AI-generated strings
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding coaching session:', error);
    throw new Error('Could not add coaching session.');
  }
}
