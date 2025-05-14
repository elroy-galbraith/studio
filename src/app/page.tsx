
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/app-header';
import { TranscriptForm } from '@/components/transcript-form';
import { InsightsDisplayCard } from '@/components/insights-display-card';
import { ActionItemsList } from '@/components/action-item-card';
import type { CoachingSessionResult, ClientActionItem, FormState } from '@/types'; 
import { transcriptFormInitialState } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { processTranscriptAction } from '@/lib/actions'; 
import { useActionState } from 'react'; 

// Helper to generate unique IDs for client-side items
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function HomePage() {
  const [formState, formAction] = useActionState(processTranscriptAction, transcriptFormInitialState);
  const { toast } = useToast();
  
  const [processedData, setProcessedData] = React.useState<CoachingSessionResult | null>(null);
  const [clientActionItems, setClientActionItems] = React.useState<ClientActionItem[]>([]);

  React.useEffect(() => {
    if (formState?.timestamp) { 
      if (formState.data) {
        setProcessedData(formState.data);
        const initialClientActionItems = formState.data.actionItems.map((desc, index) => ({
          id: generateId(),
          description: desc,
          status: 'open' as const,
          teamMemberName: formState.data!.teamMemberName,
        }));
        setClientActionItems(initialClientActionItems);
      } else {
        setProcessedData(null);
        setClientActionItems([]);
      }
    }
  }, [formState]);


  const handleUpdateActionItem = (updatedItem: ClientActionItem) => {
    setClientActionItems((prevItems) =>
      prevItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    toast({
      title: "Action Item Updated",
      description: `Status for "${updatedItem.description.substring(0,30)}..." updated.`,
    });
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
            onFormSubmit={(formData) => formAction(formData)} 
            currentServerState={formState}
          />
        </div>

        {processedData && (
          <div className="mt-12 space-y-8">
            <InsightsDisplayCard insights={processedData} />
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
