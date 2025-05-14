'use client';

import * as React from 'react';
import { format } from 'date-fns';
import type { ClientActionItem, ActionItemStatus } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { CalendarIcon, CheckCircle2, CircleDotDashed, CircleSlash } from 'lucide-react'; // Replaced CircleDot with CircleDotDashed
import { cn } from '@/lib/utils';

interface ActionItemCardProps {
  item: ClientActionItem;
  onUpdate: (updatedItem: ClientActionItem) => void;
}

const statusIcons: Record<ActionItemStatus, React.ElementType> = {
  open: CircleSlash,
  'in progress': CircleDotDashed,
  done: CheckCircle2,
};

const statusColors: Record<ActionItemStatus, string> = {
  open: 'border-red-500 text-red-700 dark:text-red-400',
  'in progress': 'border-yellow-500 text-yellow-700 dark:text-yellow-400',
  done: 'border-green-500 text-green-700 dark:text-green-400',
};


export function ActionItemCard({ item, onUpdate }: ActionItemCardProps) {
  const [status, setStatus] = React.useState<ActionItemStatus>(item.status);
  const [dueDate, setDueDate] = React.useState<Date | undefined>(item.dueDate ? new Date(item.dueDate) : undefined);

  const handleStatusChange = (newStatus: ActionItemStatus) => {
    setStatus(newStatus);
    onUpdate({ ...item, status: newStatus, dueDate });
  };

  const handleDateChange = (newDate?: Date) => {
    setDueDate(newDate);
    onUpdate({ ...item, status, dueDate: newDate });
  };

  const StatusIcon = statusIcons[status];

  return (
    <Card className={cn("shadow-md transition-all duration-300", statusColors[status])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium flex items-center">
            <StatusIcon className="mr-2 h-5 w-5" />
            Action Item
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 pb-4 px-4 border-t">
        <div className="w-full sm:w-auto space-y-1">
          <Label htmlFor={`status-${item.id}`} className="text-xs text-muted-foreground">Status</Label>
          <Select value={status} onValueChange={(value) => handleStatusChange(value as ActionItemStatus)}>
            <SelectTrigger id={`status-${item.id}`} className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder="Set status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto space-y-1">
          <Label htmlFor={`dueDate-${item.id}`} className="text-xs text-muted-foreground">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={`dueDate-${item.id}`}
                variant="outline"
                className={cn(
                  'w-full sm:w-[180px] h-9 justify-start text-left font-normal text-sm',
                  !dueDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={handleDateChange}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ActionItemsList({ items, onUpdateItem }: { items: ClientActionItem[], onUpdateItem: (item: ClientActionItem) => void }) {
  if (!items || items.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No action items generated for this session.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-primary flex items-center">
        Action Items
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <ActionItemCard key={item.id} item={item} onUpdate={onUpdateItem} />
        ))}
      </div>
    </div>
  );
}
