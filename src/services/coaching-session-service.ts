
// @/services/coaching-session-service.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import type { CoachingSessionResult, CoachingSession, ClientActionItem } from '@/types';

const COACHING_SESSIONS_COLLECTION = 'coachingSessions';

interface CoachingSessionForStorage extends Omit<CoachingSessionResult, 'sessionDate' | 'actionItems' | 'id'> {
  teamMemberId: string;
  sessionDate: Timestamp; // Stored as Firestore Timestamp
  actionItems: Omit<ClientActionItem, 'dueDate' | 'teamMemberName'> & { dueDate?: string }[]; // dueDate as ISO string
  createdAt: Timestamp; // Firestore server timestamp
}

/**
 * Adds a new coaching session to Firestore.
 * @param sessionData - The coaching session data to store (actionItems are already ClientActionItem[]).
 * @param teamMemberId - The ID of the team member associated with this session.
 * @returns The ID of the newly created coaching session document.
 */
export async function addCoachingSession(
  sessionData: CoachingSessionResult, // Expects actionItems to be ClientActionItem[]
  teamMemberId: string
): Promise<string> {
  if (!teamMemberId || typeof teamMemberId !== 'string' || teamMemberId.trim() === '') {
    throw new Error('Team member ID must be a non-empty string.');
  }
  if (!sessionData) {
    throw new Error('Session data cannot be empty.');
  }

  try {
    const actionItemsForStorage = sessionData.actionItems.map(item => ({
      id: item.id,
      description: item.description,
      status: item.status,
      dueDate: item.dueDate?.toISOString(), // Convert Date to ISO string for storage
      // teamMemberName is not stored per action item in this collection
    }));


    const docData: Omit<CoachingSessionForStorage, 'createdAt' | 'teamMemberName'> = { // teamMemberName is part of sessionData but not directly in CoachingSessionForStorage root
      teamMemberId: teamMemberId.trim(),
      sessionDate: Timestamp.fromDate(new Date(sessionData.sessionDate)),
      transcript: sessionData.transcript,
      growthThemes: sessionData.growthThemes || [],
      skillsToDevelop: sessionData.skillsToDevelop || [],
      suggestedCoachingQuestions: sessionData.suggestedCoachingQuestions || [],
      actionItems: actionItemsForStorage,
    };

    const docRef = await addDoc(collection(db, COACHING_SESSIONS_COLLECTION), {
      ...docData,
      teamMemberName: sessionData.teamMemberName, // Ensure teamMemberName is stored at the session level
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
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Robust action item mapping
      const rawActionItems = data.actionItems || [];
      const mappedActionItems: ClientActionItem[] = rawActionItems.map((actionItemData: any, index: number) => {
        const teamMemberNameForActionItem = data.teamMemberName || 'Unknown Member'; // Fallback for teamMemberName

        if (typeof actionItemData === 'string') {
          // Handle old data: action item is just a string description
          return {
            id: `fallback-${docSnap.id}-${index}`, // Generate a predictable fallback ID for display
            description: actionItemData,
            status: 'open' as const, // Default status
            dueDate: undefined,
            teamMemberName: teamMemberNameForActionItem,
          };
        } else if (typeof actionItemData === 'object' && actionItemData !== null) {
          // Handle new data: action item is an object
          return {
            id: actionItemData.id || `fallback-${docSnap.id}-${index}`, // Use existing ID or fallback
            description: actionItemData.description || 'No description provided',
            status: actionItemData.status || ('open' as const),
            dueDate: actionItemData.dueDate ? new Date(actionItemData.dueDate) : undefined,
            teamMemberName: teamMemberNameForActionItem,
          };
        }
        // If it's neither a string nor a valid object, it will be filtered out
        return null; 
      }).filter((item): item is ClientActionItem => item !== null); // Filter out nulls and assert type

      sessions.push({
        id: docSnap.id,
        teamMemberId: data.teamMemberId,
        teamMemberName: data.teamMemberName,
        sessionDate: (data.sessionDate as Timestamp).toDate().toISOString(),
        transcript: data.transcript,
        growthThemes: data.growthThemes,
        skillsToDevelop: data.skillsToDevelop,
        suggestedCoachingQuestions: data.suggestedCoachingQuestions,
        actionItems: mappedActionItems,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      });
    });
    return sessions;
  } catch (error) {
    console.error('Error fetching coaching sessions by team member ID:', error);
    throw new Error('Could not fetch coaching sessions.');
  }
}

/**
 * Updates the action items for a specific coaching session in Firestore.
 * @param sessionId - The ID of the coaching session document.
 * @param actionItems - The array of ClientActionItem objects to set.
 */
export async function updateCoachingSessionActionItems(sessionId: string, actionItems: ClientActionItem[]): Promise<void> {
  if (!sessionId) {
    throw new Error('Session ID must be provided.');
  }
  if (!actionItems) { // Array can be empty, but not null/undefined itself
    throw new Error('Action items array must be provided.');
  }

  try {
    const sessionRef = doc(db, COACHING_SESSIONS_COLLECTION, sessionId);
    // Ensure actionItems are structured correctly for storage, especially converting Date to ISO string
    const actionItemsForStorage = actionItems.map(item => ({
      id: item.id,
      description: item.description,
      status: item.status,
      dueDate: item.dueDate?.toISOString(), // Convert Date to ISO string
      // teamMemberName is not part of the stored action item structure in the session document's array
    }));
    await updateDoc(sessionRef, {
      actionItems: actionItemsForStorage,
    });
  } catch (error) {
    console.error('Error updating action items in session:', error);
    throw new Error('Could not update action items.');
  }
}
