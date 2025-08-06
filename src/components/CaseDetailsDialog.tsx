
import React from 'react';
import { Calendar, User, Brain, MapPin, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface CaseDetailsDialogProps {
  case: MedicalCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CaseDetailsDialog: React.FC<CaseDetailsDialogProps> = ({ 
  case: caseData, 
  open, 
  onOpenChange 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-slate-100 text-slate-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Case Details - {caseData.patientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Patient ID</label>
              <p className="text-lg font-mono">{caseData.patientId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Patient Name</label>
              <p className="text-lg">{caseData.patientName}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={getPriorityColor(caseData.priority)}>
              {caseData.priority.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(caseData.status)}>
              {caseData.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {caseData.imageType}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Body Part: {caseData.bodyPart}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Brain className="h-4 w-4" />
              <span>AI Confidence: {caseData.aiConfidence}%</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Image Age: {caseData.imageAge}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created: {formatDate(caseData.createdAt)}</span>
            </div>
          </div>

          {caseData.assignedTo && (
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>Assigned to: {caseData.assignedTo}</span>
            </div>
          )}

          {caseData.findings && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-700 mb-2">AI Findings:</h4>
              <p className="text-slate-600">{caseData.findings}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-medium text-slate-700">Timeline:</h4>
            <div className="text-sm text-gray-600">
              <p>Created: {formatDate(caseData.createdAt)}</p>
              <p>Last Updated: {formatDate(caseData.updatedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
