
import React, { useState } from 'react';
import { CasesList } from './CasesList';
import { TimelineView } from './TimelineView';
import { TileView } from './TileView';
import { ImageUploadDialog } from './ImageUploadDialog';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { Upload, FileImage, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ManualUploadViewProps {
  cases: MedicalCase[];
  viewMode: 'list' | 'timeline' | 'tile';
  selectedPriority: string | null;
  selectedStatus: string | null;
  onUpdateCase: (updatedCase: MedicalCase) => void;
  onCaseCreated?: (caseData: any) => void;
}

export const ManualUploadView: React.FC<ManualUploadViewProps> = ({
  cases,
  viewMode,
  onUpdateCase,
  onCaseCreated
}) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Filter to only show manual upload cases
  const manualCases = cases.filter(case_ => case_.source === 'manual');

  const handleUploadComplete = () => {
    setUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Compact Upload Action */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-600 rounded-lg shadow-sm">
            <Upload className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Upload Medical Images</h3>
            <p className="text-sm text-slate-600">
              Add DICOM files or medical images for analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Manual Upload
          </Badge>
          <Button 
            onClick={() => setUploadDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {/* Cases Display */}
      {manualCases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileImage className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Manual Uploads</h3>
            <p className="text-slate-600 mb-4">
              Upload medical images to get started with manual case management.
            </p>
            <Button 
              onClick={() => setUploadDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Manual Upload Cases
                </h2>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Manual Upload
              </Badge>
            </div>
            <Badge variant="secondary">
              {manualCases.length} {manualCases.length === 1 ? 'case' : 'cases'}
            </Badge>
          </div>

          {viewMode === 'list' ? (
            <CasesList 
              cases={manualCases}
              selectedPriority={null}
              selectedStatus={null}
              onUpdateCase={onUpdateCase}
            />
          ) : viewMode === 'tile' ? (
            <TileView 
              cases={manualCases}
              onUpdateCase={onUpdateCase}
            />
          ) : (
            <TimelineView cases={manualCases} />
          )}
        </div>
      )}

      <ImageUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={handleUploadComplete}
        title="Upload Medical Images"
      />
    </div>
  );
};
