
import React from 'react';
import { CasesList } from './CasesList';
import { TileView } from './TileView';
import { TimelineView } from './TimelineView';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { Bot, Database, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SystemProcessedViewProps {
  cases: MedicalCase[];
  viewMode: 'list' | 'timeline' | 'tile';
  selectedPriority: string | null;
  selectedStatus: string | null;
  onUpdateCase?: (updatedCase: MedicalCase) => void;
}

export const SystemProcessedView: React.FC<SystemProcessedViewProps> = ({
  cases,
  viewMode,
  selectedPriority,
  selectedStatus,
  onUpdateCase
}) => {
  // Filter to only show system-processed cases (not manual uploads)
  const systemCases = cases.filter(case_ => case_.source === 'system');

  const renderContent = () => {
    if (systemCases.length === 0) {
      return (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No System-Processed Cases Yet
            </h3>
            <p className="text-slate-600 mb-4 max-w-md">
              System-processed cases from automated DICOM analysis will appear here. 
              Upload DICOM files to Supabase Storage to get started.
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>Automatic Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>AI Analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (viewMode) {
      case 'timeline':
        return (
          <TimelineView 
            cases={systemCases}
            selectedPriority={selectedPriority}
            selectedStatus={selectedStatus}
            onUpdateCase={onUpdateCase}
          />
        );
      case 'tile':
        return (
          <TileView 
            cases={systemCases}
            selectedPriority={selectedPriority}
            selectedStatus={selectedStatus}
            onUpdateCase={onUpdateCase}
          />
        );
      default:
        return (
          <CasesList 
            cases={systemCases}
            selectedPriority={selectedPriority}
            selectedStatus={selectedStatus}
            onUpdateCase={onUpdateCase}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with system info */}
      {systemCases.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                System Processed Cases
              </h2>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              AI Analyzed
            </Badge>
          </div>
          <Badge variant="secondary">
            {systemCases.length} {systemCases.length === 1 ? 'case' : 'cases'}
          </Badge>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};
