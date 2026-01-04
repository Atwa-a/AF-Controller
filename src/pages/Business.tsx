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
import { toast } from 'sonner';
import { Plus, Building2, Edit2, Trash2, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Business = Tables<'businesses'>;

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Real Estate', 'Consulting', 'Education', 'Entertainment', 'Other'
];

const Business = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    revenue: '',
    status: 'active'
  });

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['businesses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('user_id', user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('businesses').insert({
        user_id: user!.id,
        name: data.name,
        description: data.description || null,
        industry: data.industry || null,
        revenue: data.revenue ? parseFloat(data.revenue) : 0,
        status: data.status
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Business created successfully');
      resetForm();
    },
    onError: () => toast.error('Failed to create business'),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { error } = await supabase.from('businesses')
        .update({
          name: data.name,
          description: data.description || null,
          industry: data.industry || null,
          revenue: data.revenue ? parseFloat(data.revenue) : 0,
          status: data.status
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Business updated successfully');
      resetForm();
    },
    onError: () => toast.error('Failed to update business'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('businesses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      toast.success('Business deleted successfully');
    },
    onError: () => toast.error('Failed to delete business'),
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', industry: '', revenue: '', status: 'active' });
    setEditingBusiness(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      description: business.description || '',
      industry: business.industry || '',
      revenue: business.revenue?.toString() || '',
      status: business.status
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (editingBusiness) {
      updateMutation.mutate({ ...formData, id: editingBusiness.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalRevenue = businesses?.reduce((sum, b) => sum + (Number(b.revenue) || 0), 0) || 0;
  const activeBusinesses = businesses?.filter(b => b.status === 'active').length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
            Business Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your business ventures
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-primary/20">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary">
                {editingBusiness ? 'Edit Business' : 'Add New Business'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter business name"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                  className="bg-muted/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Revenue</Label>
                <Input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                  placeholder="0.00"
                  className="bg-muted/50"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingBusiness ? 'Update' : 'Create'}
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
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-display font-bold text-primary">{businesses?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-display font-bold text-accent">{activeBusinesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-display font-bold text-primary">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Loading...</p>
        ) : businesses && businesses.length > 0 ? (
          businesses.map((business) => {
            const deptCount = departments?.filter(d => d.business_id === business.id).length || 0;
            
            return (
              <Card key={business.id} className="glass border-border/50 hover:border-primary/30 transition-all card-3d">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-display text-foreground">{business.name}</CardTitle>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          business.status === 'active' ? 'bg-accent/20 text-accent' :
                          business.status === 'inactive' ? 'bg-destructive/20 text-destructive' :
                          'bg-glow-warning/20 text-glow-warning'
                        }`}>
                          {business.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(business)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(business.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {business.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{business.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    {business.industry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span className="text-foreground">{business.industry}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="text-accent font-medium">${Number(business.revenue || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departments</span>
                      <span className="text-foreground">{deptCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full glass border-border/50">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No businesses yet. Add your first business to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Business;
