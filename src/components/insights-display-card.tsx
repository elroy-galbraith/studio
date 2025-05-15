
'use client';

import type { CoachingSessionResult } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, HelpCircle, Download } from 'lucide-react';
import { downloadTextFile } from '@/lib/utils';
import { format } from 'date-fns';

interface InsightsDisplayCardProps {
  insights: CoachingSessionResult;
}

const InsightSection: React.FC<{ title: string; items: string[] | undefined; icon: React.ElementType, colorClass?: string }> = ({ title, items, icon: Icon, colorClass = "bg-secondary text-secondary-foreground" }) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      <Icon className="h-6 w-6 mr-3 text-primary" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
    {items && items.length > 0 ? (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className={`p-3 rounded-md shadow-sm ${colorClass}`}>
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted-foreground">No insights generated for this section.</p>
    )}
  </div>
);

export function InsightsDisplayCard({ insights }: InsightsDisplayCardProps) {
  if (!insights) return null;

  const { growthThemes, skillsToDevelop, suggestedCoachingQuestions, teamMemberName, sessionDate, actionItems } = insights;

  const formatInsightsForExport = (): string => {
    let content = `CoachLoop Session Summary\n`;
    content += `=========================\n\n`;
    content += `Team Member: ${teamMemberName}\n`;
    content += `Session Date: ${new Date(sessionDate).toLocaleDateString()}\n\n`;

    content += `-------------------------\nKey Growth Themes:\n-------------------------\n`;
    (growthThemes || []).forEach(theme => content += `- ${theme}\n`);
    content += `\n`;

    content += `-------------------------\nSkills to Develop:\n-------------------------\n`;
    (skillsToDevelop || []).forEach(skill => content += `- ${skill}\n`);
    content += `\n`;

    content += `---------------------------------------------\nSuggested Coaching Questions (for next 1:1):\n---------------------------------------------\n`;
    (suggestedCoachingQuestions || []).forEach(question => content += `- ${question}\n`);
    content += `\n`;

    content += `-------------------------\nAction Items:\n-------------------------\n`;
    (actionItems || []).forEach(item => {
      content += `- [${item.status}] ${item.description}`;
      if (item.dueDate) {
        content += ` (Due: ${format(new Date(item.dueDate), 'PPP')})`;
      }
      content += `\n`;
    });
    content += `\n`;

    return content;
  };

  const handleExport = () => {
    const fileContent = formatInsightsForExport();
    const safeName = teamMemberName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const formattedDate = format(new Date(sessionDate), 'yyyy-MM-dd');
    downloadTextFile(`coachloop_insights_${safeName}_${formattedDate}.txt`, fileContent);
  };


  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl text-primary">Coaching Insights</CardTitle>
            <CardDescription>
              For: <Badge variant="outline" className="text-base">{teamMemberName}</Badge> | Date: <Badge variant="outline" className="text-base">{new Date(sessionDate).toLocaleDateString()}</Badge>
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <InsightSection title="Growth Themes" items={growthThemes} icon={Lightbulb} colorClass="bg-blue-100 dark:bg-blue-900/50" />
        <InsightSection title="Skills to Develop" items={skillsToDevelop} icon={Target} colorClass="bg-green-100 dark:bg-green-900/50" />
        <InsightSection title="Suggested Coaching Questions" items={suggestedCoachingQuestions} icon={HelpCircle} colorClass="bg-yellow-100 dark:bg-yellow-900/50" />
      </CardContent>
      {/* CardFooter could be used if action items were displayed here, but they are in a separate component */}
    </Card>
  );
}
