import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Mail, Phone, User, MessageSquare } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

interface BusinessPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BusinessPlanDialog: React.FC<BusinessPlanDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { submitBusinessPlanRequest } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: user?.email || '',
    phone: '',
    use_case: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await submitBusinessPlanRequest(formData);
      if (success) {
        onOpenChange(false);
        setFormData({
          name: '',
          organization: '',
          email: user?.email || '',
          phone: '',
          use_case: '',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Contact Us for Business Plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization *
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              placeholder="Enter your organization name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone (Optional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="use_case" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Use Case / Message *
            </Label>
            <Textarea
              id="use_case"
              value={formData.use_case}
              onChange={(e) => handleInputChange('use_case', e.target.value)}
              placeholder="Please describe your use case, requirements, and any specific needs..."
              className="min-h-24"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.name || !formData.organization || !formData.email || !formData.use_case}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          We'll review your request and contact you within 1-2 business days with pricing and next steps.
        </div>
      </DialogContent>
    </Dialog>
  );
};