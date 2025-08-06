import React, { useState } from 'react';
import { Calendar, User, Brain, MapPin, FileText, Clock, Camera, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { FinalReportDialog } from './FinalReportDialog';
import { ReviewDialog } from './ReviewDialog';
import { StatusUpdateDialog } from './StatusUpdateDialog';

interface TileViewProps {
  cases: MedicalCase[];
  selectedPriority?: string | null;
  selectedStatus?: string | null;
  onUpdateCase?: (updatedCase: MedicalCase) => void;
}

export const TileView: React.FC<TileViewProps> = ({ 
  cases, 
  selectedPriority, 
  selectedStatus, 
  onUpdateCase 
}) => {
  const [reportDialogOpen, setReportDialogOpen] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null);

  // Filter cases based on selected priority and status
  const filteredCases = cases.filter(case_ => {
    const priorityMatch = !selectedPriority || selectedPriority === 'all' || case_.priority === selectedPriority;
    const statusMatch = !selectedStatus || selectedStatus === 'all' || case_.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'review-completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusLabel = (status: string) => {
    return status.replace(/-/g, ' ').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAgeColor = (imageAge: string) => {
    if (imageAge.includes('d')) return 'text-red-600'; // Days - urgent
    if (imageAge.includes('h') && parseInt(imageAge) > 6) return 'text-amber-600'; // More than 6 hours
    return 'text-green-600'; // Recent
  };

  const handleUpdateCase = (updatedCase: MedicalCase) => {
    if (onUpdateCase) {
      onUpdateCase(updatedCase);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Cases ({filteredCases.length})
        </h2>
      </div>
      
      {/* Grid Layout for Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCases.map((case_) => (
          <Card key={case_.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <CardContent className="p-4 space-y-3">
              {/* Header with Patient Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {case_.patientName}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {case_.patientId.slice(-4)}
                  </Badge>
                </div>
                
                {/* Priority and Status */}
                <div className="flex gap-1">
                  <Badge className={`${getPriorityColor(case_.priority)} text-xs`}>
                    {case_.priority.charAt(0).toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className={`${getStatusColor(case_.status)} text-xs`}>
                    {case_.status === 'review-completed' ? 'Done' : 
                     case_.status === 'in-progress' ? 'Progress' : 'Open'}
                  </Badge>
                </div>
              </div>

              {/* Image Info */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-1">
                  <Camera className="h-3 w-3" />
                  <span>{case_.imageType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{case_.bodyPart}</span>
                </div>
              </div>

              {/* AI Confidence and Age */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span className={`font-medium ${getConfidenceColor(case_.aiConfidence)}`}>
                    {case_.aiConfidence}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className={`h-3 w-3 ${getAgeColor(case_.imageAge)}`} />
                  <span className={getAgeColor(case_.imageAge)}>
                    {case_.imageAge}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(case_.createdAt)}</span>
              </div>

              {/* Assigned User (if any) */}
              {case_.assignedTo && (
                <div className="flex items-center space-x-1 text-xs text-slate-600">
                  <User className="h-3 w-3" />
                  <span className="truncate">{case_.assignedTo}</span>
                </div>
              )}

              {/* Findings Preview */}
              {case_.findings && (
                <div className="bg-slate-50 rounded-md p-2">
                  <div className="flex items-start space-x-1">
                    <Zap className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {case_.findings}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm"
                  onClick={() => setReviewDialogOpen(case_.id)}
                  className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                >
                  <Brain className="h-3 w-3 mr-1" />
                  {case_.status === 'review-completed' ? 'Edit' : 'Review'}
                </Button>
                {case_.status === 'review-completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReportDialogOpen(case_.id)}
                    className="flex-1 text-xs h-8 bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Report
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-slate-600">No cases match the current filters</p>
        </div>
      )}

      {/* Report Dialog */}
      {reportDialogOpen && (
        <FinalReportDialog 
          case={filteredCases.find(c => c.id === reportDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setReportDialogOpen(null)}
        />
      )}

      {/* Status Update Dialog */}
      {statusDialogOpen && (
        <StatusUpdateDialog 
          case={filteredCases.find(c => c.id === statusDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setStatusDialogOpen(null)}
          onUpdateCase={handleUpdateCase}
        />
      )}

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <ReviewDialog 
          case={filteredCases.find(c => c.id === reviewDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setReviewDialogOpen(null)}
          onUpdateCase={handleUpdateCase}
        />
      )}
    </div>
  );
};
