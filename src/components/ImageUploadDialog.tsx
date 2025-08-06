
import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EnhancedImageUpload } from '@/components/EnhancedImageUpload';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (files: any[], associatedCase?: MedicalCase) => void;
  associatedCase?: MedicalCase;
  title?: string;
}

export const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
  associatedCase,
  title = "Upload Medical Images"
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleUploadComplete = () => {
    onUploadComplete([], associatedCase);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-slate-50/50">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-2xl">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent font-bold">
                {title}
              </span>
              <p className="text-sm text-slate-600 font-normal mt-1">
                Upload medical images and create new cases with AI-powered analysis
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <EnhancedImageUpload 
            onUploadComplete={handleUploadComplete}
            title="AI-Powered Medical Image Analysis"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
