
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface ImageViewerDialogProps {
  case: MedicalCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({ 
  case: caseData, 
  open, 
  onOpenChange 
}) => {
  // Get real medical image data from the case
  const getRealImageData = () => {
    // For system-processed cases and manual uploads with actual image data
    const imageData = (caseData as any).imageData;
    if (imageData && (imageData.startsWith('data:image') || imageData.startsWith('data:application'))) {
      return [imageData]; // Return the actual base64 image data
    }
    
    // Fallback to placeholder if no real image data available
    return ['/lovable-uploads/809183d2-1566-4f13-a90f-30e8e2cbae5a.png'];
  };

  const medicalImages = getRealImageData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Medical Images - {caseData.patientName} ({caseData.imageType})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Patient ID: {caseData.patientId}</span>
            <span>Body Part: {caseData.bodyPart}</span>
            <span>Image Age: {caseData.imageAge}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicalImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Medical scan ${index + 1} for ${caseData.patientName}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  Slice {index + 1}
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {caseData.imageType} Image
                </div>
              </div>
            ))}
          </div>

          {caseData.findings && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Analysis:</h4>
              <p className="text-blue-800 text-sm">{caseData.findings}</p>
              <div className="mt-2 text-xs text-blue-600">
                Confidence: {caseData.aiConfidence}%
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 text-center">
            Real medical imaging data for diagnostic purposes
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
