
'use client';

import type { CoachingSession } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Lightbulb, Target, HelpCircle, ListChecks, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface PastSessionCardProps {
  session: CoachingSession;
}

const InsightSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ElementType, defaultOpen?: boolean }> = ({ title, items, icon: Icon, defaultOpen = false }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-3 px-4 rounded-md bg-muted/50">
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-muted-foreground" />
          <h4 className="font-medium text-muted-foreground">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground pl-7 mt-1">No {title.toLowerCase()} recorded for this session.</p>
      </div>
    );
  }

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2 text-primary" />
          <h4 className="font-medium text-foreground">{title}</h4>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2 pl-2 list-disc list-inside marker:text-primary">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-foreground/90 bg-background p-2 rounded-md shadow-sm border border-border/50">
              {item}
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export function PastSessionCard({ session }: PastSessionCardProps) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className='flex items-center'>
                <CalendarDays className="h-6 w-6 mr-3 text-primary" />
                <CardTitle className="text-xl text-foreground">
                    Session: {format(new Date(session.sessionDate), 'PPP')}
                </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
                Recorded: {format(new Date(session.createdAt), 'Pp')}
            </Badge>
        </div>
        <CardDescription className="pt-1">
          Insights and action items from the coaching session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {session.transcript && (
            <AccordionItem value="transcript">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <h4 className="font-medium text-foreground">Transcript Snippet</h4>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-foreground/90 bg-background p-3 rounded-md shadow-sm border border-border/50 max-h-40 overflow-y-auto">
                  {session.transcript.substring(0, 500)}{session.transcript.length > 500 ? '...' : ''}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}
          <InsightSection title="Growth Themes" items={session.growthThemes} icon={Lightbulb} />
          <InsightSection title="Skills to Develop" items={session.skillsToDevelop} icon={Target} />
          <InsightSection title="Suggested Coaching Questions" items={session.suggestedCoachingQuestions} icon={HelpCircle} />
          <InsightSection title="Action Items (AI Generated)" items={session.actionItems} icon={ListChecks} />
        </Accordion>
      </CardContent>
    </Card>
  );
}
