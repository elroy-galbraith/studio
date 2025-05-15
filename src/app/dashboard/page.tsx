'use client';

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, MessageSquareText, Frown, Users } from 'lucide-react';
import Link from 'next/link';
import { fetchTeamMemberDetailsAndSessionsAction } from '@/lib/actions';
import { getTeamMembers } from '@/services/team-member-service';
import type { TeamMemberDetailsAndSessions, TeamMember } from '@/types';

export default function DashboardPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMemberDetailsAndSessions[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAllTeamMembers = async () => {
      try {
        // First, get all team members
        const members = await getTeamMembers();
        
        // Then, fetch details and sessions for each team member
        const results = await Promise.all(
          members.map(async (member) => {
            try {
              const result = await fetchTeamMemberDetailsAndSessionsAction(member.id);
              return result;
            } catch (e) {
              console.error(`Error fetching details for team member ${member.id}:`, e);
              // Return a valid structure even if sessions fetch fails
              return {
                teamMember: member,
                sessions: []
              };
            }
          })
        );
        
        setTeamMembers(results.filter(result => result.teamMember !== null));
      } catch (e) {
        console.error('Failed to fetch team members:', e);
        setError(e instanceof Error ? e.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <Alert variant="destructive" className="w-full max-w-lg">
            <Frown className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-8 p-6 bg-card rounded-xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Team Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Overview of team members and their coaching sessions.
          </p>
        </div>

        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-xl shadow-md">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Team Members</h2>
            <p className="text-muted-foreground">
              There are no team members in the system yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(({ teamMember, sessions }) => (
              <Link
                key={teamMember?.id}
                href={`/team-members/${teamMember?.id}`}
                className="block"
              >
                <div className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <UserCircle className="h-8 w-8 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
                      {teamMember?.name}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MessageSquareText className="h-4 w-4" />
                      <span>{sessions.length} coaching sessions</span>
                    </div>
                    {sessions.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Last session: {new Date(sessions[0].sessionDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/30">
        &copy; {new Date().getFullYear()} CoachLoop. AI-Powered Coaching Assistance.
      </footer>
    </div>
  );
} 