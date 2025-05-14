// @/services/team-member-service.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { TeamMember } from '@/types';

const TEAM_MEMBERS_COLLECTION = 'teamMembers';

// Helper function to convert Firestore data to plain objects
function convertFirestoreData(data: any): any {
  if (!data) return data;
  
  // Handle Timestamp objects
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(convertFirestoreData);
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertFirestoreData(value);
    }
    return converted;
  }
  
  return data;
}

/**
 * Adds a new team member to Firestore.
 * @param name - The name of the team member.
 * @returns The newly created team member object with its ID.
 */
export async function addTeamMember(name: String): Promise<TeamMember> {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Team member name must be a non-empty string.');
  }
  try {
    const docRef = await addDoc(collection(db, TEAM_MEMBERS_COLLECTION), {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
    return {
      id: docRef.id,
      name: name.trim(),
      // createdAt will be populated by Firestore, not including it here
      // as we don't have the resolved serverTimestamp value immediately
    };
  } catch (error) {
    console.error('Error adding team member:', error);
    throw new Error('Could not add team member.');
  }
}

/**
 * Fetches all team members from Firestore, ordered by name.
 * @returns A promise that resolves to an array of TeamMember objects.
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const q = query(collection(db, TEAM_MEMBERS_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    const members: TeamMember[] = [];
    querySnapshot.forEach((doc) => {
      const data = convertFirestoreData(doc.data());
      members.push({ id: doc.id, ...data } as TeamMember);
    });
    return members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw new Error('Could not fetch team members.');
  }
}

/**
 * Fetches a single team member by their ID from Firestore.
 * @param id - The ID of the team member to fetch.
 * @returns A promise that resolves to the TeamMember object or null if not found.
 */
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Team member ID must be a non-empty string.');
  }
  try {
    const docRef = doc(db, TEAM_MEMBERS_COLLECTION, id.trim());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = convertFirestoreData(docSnap.data());
      return { id: docSnap.id, ...data } as TeamMember;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching team member by ID:', error);
    throw new Error('Could not fetch team member by ID.');
  }
}
