
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2, AlertCircle, Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormState, TeamMember } from '@/types'; 
import { useToast } from '@/hooks/use-toast';
import { fetchTeamMembersAction } from '@/lib/actions'; // Import the new action

// Client-side validation schema
const transcriptFormSchema = z.object({
  teamMemberId: z.string().min(1, 'Team member selection is required.'), // Will hold ID or 'new'
  newTeamMemberName: z.string().optional(),
  sessionDate: z.date({ required_error: 'Session date is required.' }),
  transcript: z.string().min(50, 'Transcript must be at least 50 characters long to provide meaningful insights.'),
}).superRefine((data, ctx) => {
  if (data.teamMemberId === 'new' && (!data.newTeamMemberName || data.newTeamMemberName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "New team member name is required if 'Add New' is selected.",
      path: ['newTeamMemberName'], // Correct path for the error
    });
  }
});

type TranscriptFormValues = z.infer<typeof transcriptFormSchema>;

interface TranscriptFormProps {
  onFormSubmit: (formData: FormData) => void;
  currentServerState: FormState | undefined;
}

export function TranscriptForm({ onFormSubmit, currentServerState }: TranscriptFormProps) {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = React.useState(true);

  const form = useForm<TranscriptFormValues>({
    resolver: zodResolver(transcriptFormSchema),
    defaultValues: {
      teamMemberId: '',
      newTeamMemberName: '',
      sessionDate: undefined, 
      transcript: '',
    },
  });

  const watchedTeamMemberId = form.watch('teamMemberId');

  React.useEffect(() => {
    form.setValue('sessionDate', new Date());

    const loadTeamMembers = async () => {
      setIsLoadingTeamMembers(true);
      try {
        const members = await fetchTeamMembersAction();
        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load team members. Please try again later.",
        });
      }
      setIsLoadingTeamMembers(false);
    };
    loadTeamMembers();
  }, [form, toast]);


  React.useEffect(() => {
    if (currentServerState?.timestamp) { 
      if (currentServerState.message) {
        if (currentServerState.data) { 
          toast({
            title: "Success!",
            description: currentServerState.message,
          });
          form.reset({ 
            teamMemberId: '',
            newTeamMemberName: '',
            transcript: '',
            sessionDate: new Date(), 
          }); 
        } else { 
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
    formData.append('teamMemberId', data.teamMemberId);
    if (data.teamMemberId === 'new' && data.newTeamMemberName) {
      formData.append('newTeamMemberName', data.newTeamMemberName);
    }
    formData.append('sessionDate', data.sessionDate instanceof Date ? data.sessionDate.toISOString() : (data.sessionDate || new Date().toISOString()));
    formData.append('transcript', data.transcript);
    onFormSubmit(formData); 
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
              <Label htmlFor="teamMemberId" className="font-medium">Team Member</Label>
              <Controller
                name="teamMemberId"
                control={form.control}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== 'new') {
                        form.setValue('newTeamMemberName', ''); // Clear new name if existing selected
                        form.clearErrors('newTeamMemberName');
                      }
                    }} 
                    value={field.value}
                    disabled={isLoadingTeamMembers}
                  >
                    <SelectTrigger 
                      id="teamMemberId" 
                      className={cn(form.formState.errors.teamMemberId ? 'border-destructive focus-visible:ring-destructive' : 'border-input')}
                      aria-invalid={!!form.formState.errors.teamMemberId}
                    >
                      <SelectValue placeholder={isLoadingTeamMembers ? "Loading members..." : "Select team member"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingTeamMembers ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="new">
                            <div className="flex items-center">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add New Team Member
                            </div>
                          </SelectItem>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.teamMemberId && (
                <p className="text-sm text-destructive">{form.formState.errors.teamMemberId.message}</p>
              )}
            </div>

            {watchedTeamMemberId === 'new' && (
              <div className="space-y-2 md:col-span-1"> {/* Occupies one column on medium screens */}
                <Label htmlFor="newTeamMemberName" className="font-medium">New Team Member Name</Label>
                <Input
                  id="newTeamMemberName"
                  {...form.register('newTeamMemberName')}
                  placeholder="e.g., Alex Johnson"
                  className={cn(form.formState.errors.newTeamMemberName ? 'border-destructive focus-visible:ring-destructive' : 'border-input')}
                  aria-invalid={!!form.formState.errors.newTeamMemberName}
                />
                {form.formState.errors.newTeamMemberName && (
                  <p className="text-sm text-destructive">{form.formState.errors.newTeamMemberName.message}</p>
                )}
              </div>
            )}
          
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
