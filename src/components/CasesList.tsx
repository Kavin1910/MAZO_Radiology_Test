
import React, { useState } from 'react';
import { Calendar, User, Brain, MapPin, FileText, Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { CaseActions } from './CaseActions';
import { FinalReportDialog } from './FinalReportDialog';
import { ImageViewerDialog } from './ImageViewerDialog';
import { StatusUpdateDialog } from './StatusUpdateDialog';
import { ReviewDialog } from './ReviewDialog';
import { parseAIFindings, severityToPriority } from '@/utils/aiFindings';

interface CasesListProps {
  cases: MedicalCase[];
  selectedPriority: string | null;
  selectedStatus: string | null;
  onUpdateCase?: (updatedCase: MedicalCase) => void;
}

export const CasesList: React.FC<CasesListProps> = ({ cases, onUpdateCase }) => {
  const [reportDialogOpen, setReportDialogOpen] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    console.log(`🎨 Getting color for priority: "${priority}" (type: ${typeof priority})`);
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: 
        console.warn(`⚠️  Unknown priority: "${priority}" (type: ${typeof priority})`);
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    return new Date(dateString).toLocaleString();
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

  // Get the actual severity and confidence from AI findings text
  const getDisplayValues = (case_: MedicalCase) => {
    const parsed = parseAIFindings(case_.findings || '');
    
    // Use values from AI findings if available, otherwise fall back to database values
    const displaySeverity = parsed.severity !== null ? parsed.severity : (case_ as any).severityRating || 5;
    const displayConfidence = parsed.confidence !== null ? parsed.confidence : case_.aiConfidence;
    const displayPriority = severityToPriority(displaySeverity);
    
    console.log(`📊 Display values for case ${case_.id}:`, {
      originalPriority: case_.priority,
      originalConfidence: case_.aiConfidence,
      parsedSeverity: parsed.severity,
      parsedConfidence: parsed.confidence,
      displaySeverity,
      displayConfidence,
      displayPriority
    });
    
    return {
      severity: displaySeverity,
      confidence: displayConfidence,
      priority: displayPriority
    };
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
          Cases ({cases.length})
        </h2>
      </div>
      
      <div className="grid gap-4">
        {cases.map((case_) => {
          const displayValues = getDisplayValues(case_);
          const priorityColor = getPriorityColor(displayValues.priority);
          
          console.log(`🖥️  Rendering case ${case_.id}:`, {
            id: case_.id,
            patientName: case_.patientName,
            originalPriority: case_.priority,
            displayPriority: displayValues.priority,
            originalConfidence: case_.aiConfidence,
            displayConfidence: displayValues.confidence,
            displaySeverity: displayValues.severity
          });
          
          return (
            <Card key={case_.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {case_.patientName}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {case_.patientId}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={priorityColor}>
                        {displayValues.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(case_.status)}>
                        {formatStatusLabel(case_.status)}
                      </Badge>
                      <Badge variant="outline">
                        {case_.imageType}
                      </Badge>
                      <Badge variant="outline" className={`${getAgeColor(case_.imageAge)} border-current`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {case_.imageAge}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-slate-600">
                        <Brain className="h-4 w-4" />
                        <span className={`font-medium ${getConfidenceColor(displayValues.confidence)}`}>
                          {displayValues.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{case_.bodyPart}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(case_.createdAt)}</span>
                  </div>
                  
                  {case_.assignedTo && (
                    <div className="flex items-center space-x-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>{case_.assignedTo}</span>
                    </div>
                  )}
                </div>
                
                {case_.findings && (
                  <div className="flex items-start space-x-2 p-3 bg-slate-50 rounded-lg">
                    <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">AI Findings:</p>
                      <p className="text-sm text-slate-600">{case_.findings}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    size="sm"
                    onClick={() => setReviewDialogOpen(case_.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    {case_.status === 'review-completed' ? 'Edit Case' : 'Review'}
                  </Button>
                  {case_.status === 'review-completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReportDialogOpen(case_.id)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {cases.length === 0 && (
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
          case={cases.find(c => c.id === reportDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setReportDialogOpen(null)}
        />
      )}

      {/* Status Update Dialog */}
      {statusDialogOpen && (
        <StatusUpdateDialog 
          case={cases.find(c => c.id === statusDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setStatusDialogOpen(null)}
          onUpdateCase={handleUpdateCase}
        />
      )}

      {/* Review Dialog */}
      {reviewDialogOpen && (
        <ReviewDialog 
          case={cases.find(c => c.id === reviewDialogOpen)!}
          open={true}
          onOpenChange={(open) => !open && setReviewDialogOpen(null)}
          onUpdateCase={handleUpdateCase}
        />
      )}
    </div>
  );
};
