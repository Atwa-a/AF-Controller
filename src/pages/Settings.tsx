import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Shield, Trash2, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
    onSettled: () => setSaving(false),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate();
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-primary glow-text-primary">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={user?.email || ''}
                  disabled
                  className="bg-muted/50 opacity-60"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg text-primary flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Account ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={signOut}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg text-primary">
            About ATWA'S FIELD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Version: 1.0.0</p>
          <p>A comprehensive life operations dashboard for managing businesses, finances, goals, and daily planning.</p>
          <p className="text-primary mt-4">Built with React + Supabase</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
