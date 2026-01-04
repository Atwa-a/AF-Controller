import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  DollarSign,
  PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: businesses } = useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: goals } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: todayEvents } = useQuery({
    queryKey: ['today-events', user?.id],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: savingsTargets } = useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_targets')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const totalRevenue = businesses?.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0) || 0;
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  const totalSavings = savingsTargets?.reduce((sum, s) => sum + (Number(s.current_amount) || 0), 0) || 0;
  const activeGoals = goals?.filter(g => g.status !== 'completed').length || 0;
  const completedTasks = todayEvents?.filter(e => e.completed).length || 0;
  const totalTasks = todayEvents?.length || 0;

  const statCards = [
    {
      title: 'Active Businesses',
      value: businesses?.length || 0,
      icon: Building2,
      color: 'primary',
      subtitle: 'Total registered'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'accent',
      subtitle: 'All businesses'
    },
    {
      title: 'Monthly Income',
      value: `$${totalIncome.toLocaleString()}`,
      icon: DollarSign,
      color: 'accent',
      subtitle: 'This period'
    },
    {
      title: 'Monthly Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: 'destructive',
      subtitle: 'This period'
    },
    {
      title: 'Total Savings',
      value: `$${totalSavings.toLocaleString()}`,
      icon: PiggyBank,
      color: 'primary',
      subtitle: 'Across all goals'
    },
    {
      title: 'Active Goals',
      value: activeGoals,
      icon: Target,
      color: 'accent',
      subtitle: 'In progress'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
          Command Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's your operational overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = stat.color === 'primary' ? 'text-primary' : 
                            stat.color === 'accent' ? 'text-accent' : 'text-destructive';
          const bgClass = stat.color === 'primary' ? 'bg-primary/10' : 
                         stat.color === 'accent' ? 'bg-accent/10' : 'bg-destructive/10';

          return (
            <Card key={index} className="glass border-border/50 hover:border-primary/30 transition-all duration-300 card-3d">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl lg:text-3xl font-display font-bold mt-1 ${colorClass}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${bgClass}`}>
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedTasks}/{totalTasks} completed
            </span>
          </CardHeader>
          <CardContent>
            {todayEvents && todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      event.completed ? 'bg-accent/10 opacity-60' : 'bg-muted/50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      event.priority === 'high' ? 'bg-destructive' :
                      event.priority === 'medium' ? 'bg-glow-warning' : 'bg-accent'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${event.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {event.title}
                      </p>
                      {event.start_time && (
                        <p className="text-xs text-muted-foreground">
                          {event.start_time.slice(0, 5)} - {event.end_time?.slice(0, 5) || 'No end'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Goals */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
              <Target className="w-5 h-5" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals && goals.length > 0 ? (
              <div className="space-y-4">
                {goals.slice(0, 4).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{goal.title}</p>
                      <span className="text-sm text-primary">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground capitalize">
                      {goal.category} • {goal.priority} priority
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No goals set yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="glass border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Description</th>
                      <th className="text-left py-3 px-2 text-sm text-muted-foreground font-medium">Category</th>
                      <th className="text-right py-3 px-2 text-sm text-muted-foreground font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-sm text-foreground">
                          {format(new Date(tx.date), 'MMM d')}
                        </td>
                        <td className="py-3 px-2 text-sm text-foreground">
                          {tx.description || '-'}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                            {tx.category}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-sm text-right font-medium ${
                          tx.type === 'income' ? 'text-accent' : 'text-destructive'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No transactions recorded yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
