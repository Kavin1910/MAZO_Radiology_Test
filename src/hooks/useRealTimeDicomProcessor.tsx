
import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMedicalCases } from '@/hooks/useMedicalCases';

export const useRealTimeDicomProcessor = () => {
  const { toast } = useToast();
  const { refetch } = useMedicalCases();

  // Simplified processor - just refresh cases when needed
  const processDicomFile = useCallback(async (fileName: string) => {
    try {
      console.log(`Processing notification for DICOM file: ${fileName}`);
      
      // Refresh cases to pick up any new system-processed cases
      await refetch();
      
      toast({
        title: "New DICOM File Detected",
        description: `System detected upload of ${fileName}`,
      });
    } catch (error) {
      console.error('Error processing DICOM notification:', error);
    }
  }, [refetch, toast]);

  // This hook is now primarily for system notifications
  // Manual uploads are handled directly in EnhancedImageUpload
  useEffect(() => {
    console.log('DICOM processor ready for system notifications');
  }, []);

  return {
    processDicomFile
  };
};
