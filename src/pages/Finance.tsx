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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Plus, Wallet, TrendingUp, TrendingDown, PiggyBank,
  Edit2, Trash2, DollarSign, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const transactionCategories = [
  'Salary', 'Business', 'Investment', 'Freelance', 'Other Income',
  'Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other Expense'
];

const investmentTypes = ['Stocks', 'Bonds', 'Real Estate', 'Crypto', 'Mutual Funds', 'Other'];

const Finance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Transaction dialog
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: 'income',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Savings dialog
  const [savingsDialogOpen, setSavingsDialogOpen] = useState(false);
  const [savingsForm, setSavingsForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: ''
  });

  // Investment dialog
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investForm, setInvestForm] = useState({
    name: '',
    type: '',
    amount: '',
    current_value: '',
    notes: ''
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: savings } = useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_targets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: investments } = useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mutations
  const createTransaction = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('transactions').insert({
        user_id: user!.id,
        type: txForm.type,
        amount: parseFloat(txForm.amount),
        category: txForm.category,
        description: txForm.description || null,
        date: txForm.date
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added');
      setTxDialogOpen(false);
      setTxForm({ type: 'income', amount: '', category: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    },
    onError: () => toast.error('Failed to add transaction'),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted');
    },
  });

  const createSavings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('savings_targets').insert({
        user_id: user!.id,
        name: savingsForm.name,
        target_amount: parseFloat(savingsForm.target_amount),
        current_amount: parseFloat(savingsForm.current_amount) || 0,
        deadline: savingsForm.deadline || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      toast.success('Savings goal created');
      setSavingsDialogOpen(false);
      setSavingsForm({ name: '', target_amount: '', current_amount: '', deadline: '' });
    },
    onError: () => toast.error('Failed to create savings goal'),
  });

  const createInvestment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('investments').insert({
        user_id: user!.id,
        name: investForm.name,
        type: investForm.type,
        amount: parseFloat(investForm.amount),
        current_value: parseFloat(investForm.current_value),
        notes: investForm.notes || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast.success('Investment added');
      setInvestDialogOpen(false);
      setInvestForm({ name: '', type: '', amount: '', current_value: '', notes: '' });
    },
    onError: () => toast.error('Failed to add investment'),
  });

  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
  const netBalance = totalIncome - totalExpenses;
  const totalSavings = savings?.reduce((s, sv) => s + Number(sv.current_amount), 0) || 0;
  const totalInvested = investments?.reduce((s, i) => s + Number(i.amount), 0) || 0;
  const currentPortfolioValue = investments?.reduce((s, i) => s + Number(i.current_value), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
          Finance Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your income, expenses, savings, and investments
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-display font-bold text-accent">${totalIncome.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-xl font-display font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-xl font-display font-bold text-primary">${totalSavings.toLocaleString()}</p>
              </div>
              <PiggyBank className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio</p>
                <p className="text-xl font-display font-bold text-accent">${currentPortfolioValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-primary/20">
                <DialogHeader>
                  <DialogTitle className="font-display text-primary">New Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createTransaction.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={txForm.type} onValueChange={(v) => setTxForm({ ...txForm, type: v })}>
                        <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <Input type="number" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} className="bg-muted/50" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={txForm.category} onValueChange={(v) => setTxForm({ ...txForm, category: v })}>
                        <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {transactionCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} className="bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} className="bg-muted/50" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setTxDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground">Add</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-2 text-sm text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-2 text-sm text-muted-foreground">Description</th>
                        <th className="text-right py-3 px-2 text-sm text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-2 text-sm text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border/50">
                          <td className="py-3 px-2 text-sm">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                          <td className="py-3 px-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-muted">{tx.category}</span>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">{tx.description || '-'}</td>
                          <td className={`py-3 px-2 text-right font-medium ${tx.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                            {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="icon" onClick={() => deleteTransaction.mutate(tx.id)}>
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Savings Tab */}
        <TabsContent value="savings" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={savingsDialogOpen} onOpenChange={setSavingsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  New Savings Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-primary/20">
                <DialogHeader>
                  <DialogTitle className="font-display text-primary">New Savings Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createSavings.mutate(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Goal Name *</Label>
                    <Input value={savingsForm.name} onChange={(e) => setSavingsForm({ ...savingsForm, name: e.target.value })} className="bg-muted/50" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Amount *</Label>
                      <Input type="number" value={savingsForm.target_amount} onChange={(e) => setSavingsForm({ ...savingsForm, target_amount: e.target.value })} className="bg-muted/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Amount</Label>
                      <Input type="number" value={savingsForm.current_amount} onChange={(e) => setSavingsForm({ ...savingsForm, current_amount: e.target.value })} className="bg-muted/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Input type="date" value={savingsForm.deadline} onChange={(e) => setSavingsForm({ ...savingsForm, deadline: e.target.value })} className="bg-muted/50" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setSavingsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savings && savings.length > 0 ? (
              savings.map((goal) => {
                const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                return (
                  <Card key={goal.id} className="glass border-border/50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{goal.name}</h3>
                            {goal.deadline && (
                              <p className="text-xs text-muted-foreground">Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          goal.status === 'completed' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">${Number(goal.current_amount).toLocaleString()}</span>
                          <span className="text-primary">${Number(goal.target_amount).toLocaleString()}</span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">{progress.toFixed(1)}% complete</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-full glass border-border/50">
                <CardContent className="py-12 text-center">
                  <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No savings goals yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={investDialogOpen} onOpenChange={setInvestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-primary/20">
                <DialogHeader>
                  <DialogTitle className="font-display text-primary">Add Investment</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createInvestment.mutate(); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={investForm.name} onChange={(e) => setInvestForm({ ...investForm, name: e.target.value })} className="bg-muted/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select value={investForm.type} onValueChange={(v) => setInvestForm({ ...investForm, type: v })}>
                        <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {investmentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount Invested *</Label>
                      <Input type="number" value={investForm.amount} onChange={(e) => setInvestForm({ ...investForm, amount: e.target.value })} className="bg-muted/50" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Value *</Label>
                      <Input type="number" value={investForm.current_value} onChange={(e) => setInvestForm({ ...investForm, current_value: e.target.value })} className="bg-muted/50" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={investForm.notes} onChange={(e) => setInvestForm({ ...investForm, notes: e.target.value })} className="bg-muted/50" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setInvestDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary text-primary-foreground">Add</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments && investments.length > 0 ? (
              investments.map((inv) => {
                const gain = Number(inv.current_value) - Number(inv.amount);
                const gainPercent = (gain / Number(inv.amount)) * 100;
                const isPositive = gain >= 0;

                return (
                  <Card key={inv.id} className="glass border-border/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">{inv.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{inv.type}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Invested</span>
                          <span className="text-foreground">${Number(inv.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current</span>
                          <span className="text-primary font-medium">${Number(inv.current_value).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Gain/Loss</span>
                          <span className={isPositive ? 'text-accent' : 'text-destructive'}>
                            {isPositive ? '+' : ''}{gainPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-full glass border-border/50">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No investments tracked yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
