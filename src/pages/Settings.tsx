import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Bell, Monitor, Workflow, Palette } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface UserSettings {
  notification_preferences: {
    email_alerts: boolean;
    push_notifications: boolean;
    critical_case_alerts: boolean;
    daily_summary: boolean;
  };
  display_preferences: {
    theme: string;
    cases_per_page: number;
    default_view: string;
    auto_refresh: boolean;
  };
  workflow_preferences: {
    auto_assign_cases: boolean;
    priority_filter: string;
    show_confidence_scores: boolean;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    notification_preferences: {
      email_alerts: true,
      push_notifications: true,
      critical_case_alerts: true,
      daily_summary: false,
    },
    display_preferences: {
      theme: 'light',
      cases_per_page: 25,
      default_view: 'list',
      auto_refresh: true,
    },
    workflow_preferences: {
      auto_assign_cases: false,
      priority_filter: 'all',
      show_confidence_scores: true,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('Settings useEffect - user:', user);
    if (user) {
      fetchSettings();
    } else {
      // If no user, stop loading
      setLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }
    
    console.log('Fetching settings for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          notification_preferences: data.notification_preferences as UserSettings['notification_preferences'],
          display_preferences: data.display_preferences as UserSettings['display_preferences'],
          workflow_preferences: data.workflow_preferences as UserSettings['workflow_preferences'],
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notification_preferences: settings.notification_preferences,
          display_preferences: settings.display_preferences,
          workflow_preferences: settings.workflow_preferences,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value,
      },
    }));
  };

  const updateDisplaySetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      display_preferences: {
        ...prev.display_preferences,
        [key]: value,
      },
    }));
  };

  const updateWorkflowSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      workflow_preferences: {
        ...prev.workflow_preferences,
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <AppHeader variant="dashboard" showAuth={false} />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-slate-600">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <AppHeader variant="dashboard" showAuth={false} />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-slate-600">Please log in to access settings.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <AppHeader variant="dashboard" showAuth={false} />
      
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Application Settings</h1>
            <p className="text-slate-600">Customize your workflow and preferences</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Notification Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-slate-500">Receive email notifications for important updates</p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.email_alerts}
                    onCheckedChange={(checked) => updateNotificationSetting('email_alerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-slate-500">Browser notifications for real-time updates</p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.push_notifications}
                    onCheckedChange={(checked) => updateNotificationSetting('push_notifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Critical Case Alerts</Label>
                    <p className="text-sm text-slate-500">Immediate notifications for urgent cases</p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.critical_case_alerts}
                    onCheckedChange={(checked) => updateNotificationSetting('critical_case_alerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Summary</Label>
                    <p className="text-sm text-slate-500">Daily report of your case statistics</p>
                  </div>
                  <Switch
                    checked={settings.notification_preferences.daily_summary}
                    onCheckedChange={(checked) => updateNotificationSetting('daily_summary', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-green-600" />
                <span>Display Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={settings.display_preferences.theme}
                    onValueChange={(value) => updateDisplaySetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cases Per Page</Label>
                  <Select
                    value={settings.display_preferences.cases_per_page.toString()}
                    onValueChange={(value) => updateDisplaySetting('cases_per_page', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Default View</Label>
                  <Select
                    value={settings.display_preferences.default_view}
                    onValueChange={(value) => updateDisplaySetting('default_view', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="timeline">Timeline View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-slate-500">Automatically refresh case list</p>
                  </div>
                  <Switch
                    checked={settings.display_preferences.auto_refresh}
                    onCheckedChange={(checked) => updateDisplaySetting('auto_refresh', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Settings */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Workflow className="h-5 w-5 text-purple-600" />
                <span>Workflow Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Assign Cases</Label>
                    <p className="text-sm text-slate-500">Automatically assign new cases to you</p>
                  </div>
                  <Switch
                    checked={settings.workflow_preferences.auto_assign_cases}
                    onCheckedChange={(checked) => updateWorkflowSetting('auto_assign_cases', checked)}
                  />
                </div>
                
                <Separator />

                <div>
                  <Label>Default Priority Filter</Label>
                  <Select
                    value={settings.workflow_preferences.priority_filter}
                    onValueChange={(value) => updateWorkflowSetting('priority_filter', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cases</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show AI Confidence Scores</Label>
                    <p className="text-sm text-slate-500">Display confidence percentages for AI findings</p>
                  </div>
                  <Switch
                    checked={settings.workflow_preferences.show_confidence_scores}
                    onCheckedChange={(checked) => updateWorkflowSetting('show_confidence_scores', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;