
// @/services/coaching-session-service.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import type { CoachingSessionResult, CoachingSession } from '@/types';

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
      actionItems: sessionData.actionItems || [],
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding coaching session:', error);
    throw new Error('Could not add coaching session.');
  }
}

/**
 * Fetches coaching sessions for a specific team member, ordered by session date descending.
 * Can be limited to a certain number of recent sessions.
 * @param teamMemberId - The ID of the team member.
 * @param count - Optional number of recent sessions to fetch. If not provided, fetches all.
 * @returns A promise that resolves to an array of CoachingSession objects.
 */
export async function getCoachingSessionsByTeamMemberId(teamMemberId: string, count?: number): Promise<CoachingSession[]> {
  if (!teamMemberId || typeof teamMemberId !== 'string' || teamMemberId.trim() === '') {
    throw new Error('Team member ID must be a non-empty string.');
  }
  try {
    let sessionsQuery = query(
      collection(db, COACHING_SESSIONS_COLLECTION),
      where('teamMemberId', '==', teamMemberId.trim()),
      orderBy('sessionDate', 'desc')
    );

    if (count && count > 0) {
      sessionsQuery = query(sessionsQuery, limit(count));
    }

    const querySnapshot = await getDocs(sessionsQuery);
    const sessions: CoachingSession[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        teamMemberId: data.teamMemberId,
        teamMemberName: data.teamMemberName,
        sessionDate: (data.sessionDate as Timestamp).toDate().toISOString(),
        transcript: data.transcript,
        growthThemes: data.growthThemes,
        skillsToDevelop: data.skillsToDevelop,
        suggestedCoachingQuestions: data.suggestedCoachingQuestions,
        actionItems: data.actionItems,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(), // Handle potential null if serverTimestamp not resolved
      } as CoachingSession);
    });
    return sessions;
  } catch (error) {
    console.error('Error fetching coaching sessions by team member ID:', error);
    throw new Error('Could not fetch coaching sessions.');
  }
}
