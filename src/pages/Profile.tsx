import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Building, Stethoscope, Mail } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  institution: string | null;
  role: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('Profile useEffect - user:', user);
    if (user) {
      fetchProfile();
    } else {
      // If no user, stop loading
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }
    
    console.log('Fetching profile for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // Create initial profile if doesn't exist
        const newProfile = {
          id: user?.id!,
          first_name: '',
          last_name: '',
          institution: '',
          role: 'radiologist'
        };
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          institution: profile.institution,
          role: profile.role
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof ProfileData, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <AppHeader variant="dashboard" showAuth={false} />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-slate-600">Loading profile...</div>
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
            <div className="text-lg text-slate-600">Please log in to view your profile.</div>
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
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-600">Manage your personal and professional information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ''}
                      onChange={(e) => updateProfile('first_name', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ''}
                      onChange={(e) => updateProfile('last_name', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-sm text-slate-500 mt-1">Email cannot be changed from this page</p>
                </div>

                <div>
                  <Label htmlFor="institution">Institution/Hospital</Label>
                  <Input
                    id="institution"
                    value={profile?.institution || ''}
                    onChange={(e) => updateProfile('institution', e.target.value)}
                    placeholder="Enter your hospital or institution name"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Professional Role</Label>
                  <Select
                    value={profile?.role || ''}
                    onValueChange={(value) => updateProfile('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radiologist">Radiologist</SelectItem>
                      <SelectItem value="senior_radiologist">Senior Radiologist</SelectItem>
                      <SelectItem value="resident">Radiology Resident</SelectItem>
                      <SelectItem value="technologist">Radiology Technologist</SelectItem>
                      <SelectItem value="administrator">Hospital Administrator</SelectItem>
                      <SelectItem value="it_specialist">IT Specialist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : 'Name not set'
                      }
                    </p>
                    <p className="text-sm text-blue-700">
                      {profile?.role ? profile.role.replace('_', ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ') : 'Role not set'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Institution</p>
                    <p className="text-sm text-blue-700">
                      {profile?.institution || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Email</p>
                    <p className="text-sm text-blue-700">{user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Medical Professional</p>
                    <p className="text-sm text-green-700">
                      Verified healthcare provider access
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;