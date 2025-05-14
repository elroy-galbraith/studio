
'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormState } from '@/types'; 
import { useToast } from '@/hooks/use-toast';

// Client-side validation schema
const transcriptFormSchema = z.object({
  teamMemberName: z.string().min(1, 'Team member name is required.'),
  sessionDate: z.date({ required_error: 'Session date is required.' }),
  transcript: z.string().min(50, 'Transcript must be at least 50 characters long to provide meaningful insights.'),
});

type TranscriptFormValues = z.infer<typeof transcriptFormSchema>;

interface TranscriptFormProps {
  onFormSubmit: (formData: FormData) => void;
  currentServerState: FormState | undefined;
}

export function TranscriptForm({ onFormSubmit, currentServerState }: TranscriptFormProps) {
  const { toast } = useToast();

  const form = useForm<TranscriptFormValues>({
    resolver: zodResolver(transcriptFormSchema),
    defaultValues: {
      teamMemberName: '',
      sessionDate: undefined, // Changed from new Date() to prevent hydration mismatch
      transcript: '',
    },
  });

  React.useEffect(() => {
    // Set the sessionDate to today only on the client-side after mount
    // to avoid hydration mismatch.
    form.setValue('sessionDate', new Date());
  }, []); // Empty dependency array ensures this runs once on mount (client-side)


  React.useEffect(() => {
    // This effect handles displaying toasts based on server state changes
    if (currentServerState?.timestamp) { // Check timestamp to ensure it's a new state
      if (currentServerState.message) {
        if (currentServerState.data) { // Success
          toast({
            title: "Success!",
            description: currentServerState.message,
          });
          form.reset({ // Reset form fields, and re-apply client-side default for date
            teamMemberName: '',
            transcript: '',
            sessionDate: new Date(), 
          }); 
        } else { // Error (validation or processing)
          toast({
            variant: "destructive",
            title: currentServerState.issues && currentServerState.issues.length > 0 ? "Validation Error" : "Processing Error",
            description: currentServerState.message,
          });
        }
      }
    }
  }, [currentServerState, toast, form]);
  
  const handleClientSubmit = (data: TranscriptFormValues) => {
    const formData = new FormData();
    formData.append('teamMemberName', data.teamMemberName);
    // Ensure sessionDate is correctly stringified if it's a Date object
    formData.append('sessionDate', data.sessionDate instanceof Date ? data.sessionDate.toISOString() : (data.sessionDate || new Date().toISOString()));
    formData.append('transcript', data.transcript);
    onFormSubmit(formData); // This calls the server action via the prop
  };

  return (
    <Card className="w-full shadow-lg border-border/70">
      <CardHeader className="bg-muted/30 rounded-t-lg py-4 px-6">
        <CardTitle className="text-xl">New Coaching Session</CardTitle>
        <CardDescription>Enter details to extract insights.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(handleClientSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teamMemberName" className="font-medium">Team Member Name</Label>
              <Input
                id="teamMemberName"
                {...form.register('teamMemberName')}
                placeholder="e.g., Alex Johnson"
                className={cn(form.formState.errors.teamMemberName ? 'border-destructive focus-visible:ring-destructive' : 'border-input')}
                aria-invalid={!!form.formState.errors.teamMemberName}
              />
              {form.formState.errors.teamMemberName && (
                <p className="text-sm text-destructive">{form.formState.errors.teamMemberName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDate" className="font-medium">Session Date</Label>
              <Controller
                name="sessionDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                          form.formState.errors.sessionDate ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                        )}
                        aria-invalid={!!form.formState.errors.sessionDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date > new Date(new Date().setHours(23,59,59,999)) || date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {form.formState.errors.sessionDate && (
                <p className="text-sm text-destructive">{form.formState.errors.sessionDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript" className="font-medium">Transcript</Label>
            <Textarea
              id="transcript"
              {...form.register('transcript')}
              placeholder="Paste the coaching session transcript here. Ensure it's detailed enough for quality insights."
              rows={10}
              className={cn(form.formState.errors.transcript ? 'border-destructive focus-visible:ring-destructive' : 'border-input')}
              aria-invalid={!!form.formState.errors.transcript}
            />
            {form.formState.errors.transcript && (
              <p className="text-sm text-destructive">{form.formState.errors.transcript.message}</p>
            )}
          </div>

          {/* Server-side validation issues display (issues from FormState) */}
          {currentServerState?.issues && currentServerState.issues.length > 0 && !currentServerState.data && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Server Validation Error</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1">
                  {currentServerState.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus(); 
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto transition-all duration-150 ease-in-out hover:shadow-md active:scale-[0.98]">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Insights...
        </>
      ) : (
        'Extract Insights'
      )}
    </Button>
  );
}

