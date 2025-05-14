import type { CoachingSessionResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, HelpCircle, Brain } from 'lucide-react';

interface InsightsDisplayCardProps {
  insights: CoachingSessionResult;
}

const InsightSection: React.FC<{ title: string; items: string[]; icon: React.ElementType, colorClass?: string }> = ({ title, items, icon: Icon, colorClass = "bg-secondary text-secondary-foreground" }) => (
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

  const { growthThemes, skillsToDevelop, suggestedCoachingQuestions, teamMemberName, sessionDate } = insights;

  return (
    <Card className="w-full shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Coaching Insights</CardTitle>
        <CardDescription>
          For: <Badge variant="outline" className="text-base">{teamMemberName}</Badge> | Date: <Badge variant="outline" className="text-base">{new Date(sessionDate).toLocaleDateString()}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <InsightSection title="Growth Themes" items={growthThemes} icon={Lightbulb} colorClass="bg-blue-100 dark:bg-blue-900/50" />
        <InsightSection title="Skills to Develop" items={skillsToDevelop} icon={Target} colorClass="bg-green-100 dark:bg-green-900/50" />
        <InsightSection title="Suggested Coaching Questions" items={suggestedCoachingQuestions} icon={HelpCircle} colorClass="bg-yellow-100 dark:bg-yellow-900/50" />
      </CardContent>
    </Card>
  );
}
