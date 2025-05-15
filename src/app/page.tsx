
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { TranscriptForm } from '@/components/transcript-form';
import { InsightsDisplayCard } from '@/components/insights-display-card';
import { ActionItemsList } from '@/components/action-item-card';
import type { CoachingSessionResult, ClientActionItem, FormState } from '@/types';
import { transcriptFormInitialState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { processTranscriptAction, updateActionItemsAction } from '@/lib/actions';
import { useActionState, startTransition } from 'react';

export default function HomePage() {
  const [formState, formAction] = useActionState(processTranscriptAction, transcriptFormInitialState);
  const { toast } = useToast();

  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [processedData, setProcessedData] = React.useState<CoachingSessionResult | null>(null);
  const [clientActionItems, setClientActionItems] = React.useState<ClientActionItem[]>([]);

  React.useEffect(() => {
    if (formState?.timestamp) { // Indicates a new state from the server action
      if (formState.data) {
        setProcessedData(formState.data);
        setCurrentSessionId(formState.data.id || null); // Store the session ID
        // Action items are now already ClientActionItem[] from the server action
        setClientActionItems(formState.data.actionItems || []);
      } else {
        // Error or no data, clear out old data
        setProcessedData(null);
        setCurrentSessionId(null);
        setClientActionItems([]);
      }
    }
  }, [formState]);


  const handleUpdateActionItem = async (updatedItem: ClientActionItem) => {
    const newActionItems = clientActionItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setClientActionItems(newActionItems);

    if (currentSessionId) {
      startTransition(async () => {
        const result = await updateActionItemsAction(currentSessionId, newActionItems);
        if (result.success) {
          toast({
            title: "Action Item Updated",
            description: `Status for "${updatedItem.description.substring(0,30)}..." updated and saved.`,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Save Error",
            description: result.message || "Could not save action item changes.",
          });
          // Optionally, revert optimistic update here if save fails
          // For now, we'll keep the client state as is, assuming user might retry or it's a transient error.
        }
      });
    } else {
      // This case should ideally not happen if UI is structured well,
      // but good for a fallback notification.
      toast({
        variant: "destructive",
        title: "Error",
        description: "Session ID not found. Cannot save action item changes.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">

        <div className="bg-card p-6 sm:p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-2 text-gray-800 dark:text-gray-100">
            Unlock Coaching Superpowers
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Simply provide the team member's name, session date, and the transcript of your coaching conversation. CoachLoop will analyze it and surface key growth themes, skill development areas, and actionable insights.
          </p>
          <TranscriptForm
            onFormSubmit={(formData) => {
              startTransition(() => {
                setProcessedData(null); // Clear previous results immediately
                setCurrentSessionId(null);
                setClientActionItems([]);
                formAction(formData);
              });
            }}
            currentServerState={formState}
          />
        </div>

        {processedData && (
          <div className="mt-12 space-y-8">
            <InsightsDisplayCard insights={processedData} />
            {/* ActionItemsList now receives ClientActionItem[] directly */}
            <ActionItemsList items={clientActionItems} onUpdateItem={handleUpdateActionItem} />
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        &copy; {new Date().getFullYear()} CoachLoop. AI-Powered Coaching Assistance.
      </footer>
    </div>
  );
}
