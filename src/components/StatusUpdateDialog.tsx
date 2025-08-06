
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { useToast } from '@/hooks/use-toast';

interface StatusUpdateDialogProps {
  case: MedicalCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCase: (updatedCase: MedicalCase) => void;
}

type StatusType = 'open' | 'in-progress' | 'review-completed';

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({ 
  case: caseData, 
  open, 
  onOpenChange,
  onUpdateCase
}) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusType>(caseData.status as StatusType);
  const [assignedTo, setAssignedTo] = useState(caseData.assignedTo || '');
  const { toast } = useToast();

  const statusOptions: { value: StatusType; label: string; description: string }[] = [
    { 
      value: 'open', 
      label: 'Open',
      description: 'Case is created but not yet reviewed. Image uploaded and ready for analysis.'
    },
    { 
      value: 'in-progress', 
      label: 'In Progress',
      description: 'Case is currently being reviewed by a radiologist. Analysis and documentation in progress.'
    },
    { 
      value: 'review-completed', 
      label: 'Review Completed',
      description: 'Case has been fully reviewed and finalized. Report is complete and ready for submission.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'review-completed': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleSave = () => {
    const updatedCase: MedicalCase = {
      ...caseData,
      status: selectedStatus,
      assignedTo: assignedTo || undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateCase(updatedCase);
    onOpenChange(false);
    
    toast({
      title: "Status Updated",
      description: `Case status changed to ${selectedStatus.replace(/-/g, ' ')}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Case Status</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Patient: {caseData.patientName}</h4>
            <p className="text-sm text-gray-600">ID: {caseData.patientId}</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Select Status</label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStatus === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(option.value)}>
                          {option.label.toUpperCase()}
                        </Badge>
                        {selectedStatus === option.value && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To (Optional)</label>
            <input
              type="text"
              placeholder="Enter doctor/technician name"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
