
import React, { useState } from 'react';
import { Mail, MessageSquare, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ReportShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareType: 'email' | 'sms';
  reportContent: string;
  patientName: string;
  patientId: string;
}

export const ReportShareDialog: React.FC<ReportShareDialogProps> = ({
  open,
  onOpenChange,
  shareType,
  reportContent,
  patientName,
  patientId
}) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const handleSend = () => {
    if (!recipient.trim()) {
      toast({
        title: "Missing Recipient",
        description: `Please enter ${shareType === 'email' ? 'an email address' : 'a phone number'}.`,
        variant: "destructive",
      });
      return;
    }

    // Simulate sending
    const action = shareType === 'email' ? 'emailed' : 'sent via SMS';
    console.log(`Report ${action} to:`, recipient);
    console.log('Message:', message);
    console.log('Report content:', reportContent);

    toast({
      title: `Report ${shareType === 'email' ? 'Emailed' : 'Sent via SMS'}`,
      description: `Medical report for ${patientName} has been ${action} successfully.`,
    });

    onOpenChange(false);
    setRecipient('');
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {shareType === 'email' ? (
              <Mail className="h-5 w-5 text-blue-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-green-600" />
            )}
            <span>{shareType === 'email' ? 'Email Report' : 'SMS Report'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <p><strong>Patient:</strong> {patientName} ({patientId})</p>
          </div>

          <div>
            <Label htmlFor="recipient">
              {shareType === 'email' ? 'Email Address' : 'Phone Number'}
            </Label>
            <Input
              id="recipient"
              type={shareType === 'email' ? 'email' : 'tel'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={shareType === 'email' ? 'doctor@hospital.com' : '+1 (555) 123-4567'}
            />
          </div>

          <div>
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            {shareType === 'email' ? <Mail className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Send {shareType === 'email' ? 'Email' : 'SMS'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
