
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { PastSessionCard } from '@/components/past-session-card';
import { fetchTeamMemberDetailsAndSessionsAction } from '@/lib/actions';
import type { TeamMemberDetailsAndSessions, TeamMember, CoachingSession } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, MessageSquareText, Frown } from 'lucide-react';

export default function TeamMemberSessionsPage() {
  const params = useParams();
  const teamMemberId = params.id as string;

  const [data, setData] = React.useState<TeamMemberDetailsAndSessions | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (teamMemberId) {
      setIsLoading(true);
      setError(null);
      fetchTeamMemberDetailsAndSessionsAction(teamMemberId)
        .then((result) => {
          if (!result.teamMember && result.sessions.length === 0) {
             // Check if the service might have returned this structure due to an internal error
             // or if the ID genuinely doesn't exist.
             const teamMemberExists = result.teamMember !== null; // A bit of a guess, could be improved if action signals error more clearly
             if (!teamMemberExists) {
                setError(`Team member with ID "${teamMemberId}" not found.`);
             } else {
                setData(result); // Potentially a member with no sessions yet
             }
          } else {
            setData(result);
          }
        })
        .catch((e) => {
          console.error('Failed to fetch team member details and sessions:', e);
          setError(e.message || 'An unexpected error occurred while fetching data.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [teamMemberId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-8 w-1/3 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
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
  
  if (!data || !data.teamMember) {
     return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
          <Alert variant="destructive" className="w-full max-w-lg">
             <Frown className="h-5 w-5" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              Team member with ID &quot;{teamMemberId}&quot; could not be found.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const { teamMember, sessions } = data;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="mb-8 p-6 bg-card rounded-xl shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <UserCircle className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {teamMember.name}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review past coaching sessions and insights for {teamMember.name}.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-xl shadow-md">
            <MessageSquareText className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Sessions Yet</h2>
            <p className="text-muted-foreground">
              There are no coaching sessions recorded for {teamMember.name}.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new session from the main page.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <PastSessionCard key={session.id} session={session} />
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
