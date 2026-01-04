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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Target, Edit2, Trash2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Goal = Tables<'goals'>;

const categories = ['Personal', 'Career', 'Financial', 'Health', 'Education', 'Relationship', 'Other'];
const priorities = ['low', 'medium', 'high'];
const statuses = ['not_started', 'in_progress', 'completed', 'on_hold'];

const Goals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'not_started',
    progress: 0,
    target_date: ''
  });

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('goals').insert({
        user_id: user!.id,
        title: form.title,
        description: form.description || null,
        category: form.category,
        priority: form.priority,
        status: form.status,
        progress: form.progress,
        target_date: form.target_date || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created');
      resetForm();
    },
    onError: () => toast.error('Failed to create goal'),
  });

  const updateGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals')
        .update({
          title: form.title,
          description: form.description || null,
          category: form.category,
          priority: form.priority,
          status: form.status,
          progress: form.progress,
          target_date: form.target_date || null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update goal'),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
      const { error } = await supabase.from('goals')
        .update({ progress, status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const resetForm = () => {
    setForm({ title: '', description: '', category: '', priority: 'medium', status: 'not_started', progress: 0, target_date: '' });
    setEditingGoal(null);
    setDialogOpen(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      progress: goal.progress,
      target_date: goal.target_date || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category) {
      toast.error('Title and category are required');
      return;
    }
    if (editingGoal) {
      updateGoal.mutate(editingGoal.id);
    } else {
      createGoal.mutate();
    }
  };

  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0;
  const inProgressGoals = goals?.filter(g => g.status === 'in_progress').length || 0;
  const totalGoals = goals?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
            Goals Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Set, track, and achieve your goals
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-primary/20 max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-primary">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Progress: {form.progress}%</Label>
                <Slider
                  value={[form.progress]}
                  onValueChange={([v]) => setForm({ ...form, progress: v })}
                  max={100}
                  step={5}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingGoal ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-display font-bold text-primary">{totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-glow-warning/10">
                <TrendingUp className="w-6 h-6 text-glow-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-display font-bold text-glow-warning">{inProgressGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-display font-bold text-accent">{completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
        ) : goals && goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} className={cn(
              "glass border-border/50 transition-all",
              goal.status === 'completed' && "opacity-70"
            )}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      goal.status === 'completed' ? "bg-accent/10" :
                      goal.status === 'in_progress' ? "bg-glow-warning/10" : "bg-primary/10"
                    )}>
                      <Target className={cn(
                        "w-5 h-5",
                        goal.status === 'completed' ? "text-accent" :
                        goal.status === 'in_progress' ? "text-glow-warning" : "text-primary"
                      )} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-medium text-foreground",
                        goal.status === 'completed' && "line-through"
                      )}>
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {goal.category}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          goal.priority === 'high' ? "bg-destructive/20 text-destructive" :
                          goal.priority === 'medium' ? "bg-glow-warning/20 text-glow-warning" :
                          "bg-accent/20 text-accent"
                        )}>
                          {goal.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(goal.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary font-medium">{goal.progress}%</span>
                  </div>
                  <Slider
                    value={[goal.progress]}
                    onValueChange={([v]) => updateProgress.mutate({ id: goal.id, progress: v })}
                    max={100}
                    step={5}
                    className="cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize flex items-center gap-1">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      goal.status === 'completed' ? "bg-accent" :
                      goal.status === 'in_progress' ? "bg-glow-warning" :
                      goal.status === 'on_hold' ? "bg-destructive" : "bg-muted-foreground"
                    )} />
                    {goal.status.replace('_', ' ')}
                  </span>
                  {goal.target_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(goal.target_date), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full glass border-border/50">
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No goals yet. Create your first goal to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Goals;
