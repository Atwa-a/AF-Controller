import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { Plus, Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DayPlanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    start_time: '',
    end_time: ''
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: events } = useQuery({
    queryKey: ['planner-events', user?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: weekEvents } = useQuery({
    queryKey: ['week-events', user?.id, format(weekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'));
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('planner_events').insert({
        user_id: user!.id,
        title: form.title,
        description: form.description || null,
        type: form.type,
        priority: form.priority,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: form.start_time || null,
        end_time: form.end_time || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events'] });
      queryClient.invalidateQueries({ queryKey: ['week-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
      toast.success('Event added');
      setDialogOpen(false);
      setForm({ title: '', description: '', type: 'task', priority: 'medium', start_time: '', end_time: '' });
    },
    onError: () => toast.error('Failed to add event'),
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('planner_events')
        .update({ completed: !completed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events'] });
      queryClient.invalidateQueries({ queryKey: ['week-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('planner_events').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner-events'] });
      queryClient.invalidateQueries({ queryKey: ['week-events'] });
      queryClient.invalidateQueries({ queryKey: ['today-events'] });
      toast.success('Event deleted');
    },
  });

  const getEventCountForDay = (date: Date) => {
    return weekEvents?.filter(e => e.date === format(date, 'yyyy-MM-dd')).length || 0;
  };

  const completedCount = events?.filter(e => e.completed).length || 0;
  const totalCount = events?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
            Day Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize your schedule and tasks
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">
                Add Event for {format(selectedDate, 'MMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createEvent.mutate(); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-muted/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">Add</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Week View */}
        <Card className="glass border-border/50 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="font-display text-lg text-primary">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekDays.map((day) => {
                const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const eventCount = getEventCountForDay(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                      isSelected
                        ? "bg-primary/10 border border-primary/30 glow-primary"
                        : "hover:bg-muted/50",
                      isToday(day) && !isSelected && "border border-accent/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex flex-col items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                        <span className="text-sm font-bold">{format(day, 'd')}</span>
                      </div>
                      {isToday(day) && (
                        <span className="text-xs text-accent">Today</span>
                      )}
                    </div>
                    {eventCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        {eventCount} {eventCount === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Schedule */}
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount} completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg transition-all",
                      event.completed ? "bg-muted/30 opacity-60" : "bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={event.completed}
                      onCheckedChange={() => toggleComplete.mutate({ id: event.id, completed: event.completed })}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={cn(
                          "font-medium",
                          event.completed ? "line-through text-muted-foreground" : "text-foreground"
                        )}>
                          {event.title}
                        </h3>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          event.priority === 'high' ? "bg-destructive/20 text-destructive" :
                          event.priority === 'medium' ? "bg-glow-warning/20 text-glow-warning" :
                          "bg-accent/20 text-accent"
                        )}>
                          {event.priority}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                          {event.type}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                      {event.start_time && (
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.start_time.slice(0, 5)} {event.end_time && `- ${event.end_time.slice(0, 5)}`}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEvent.mutate(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DayPlanner;
