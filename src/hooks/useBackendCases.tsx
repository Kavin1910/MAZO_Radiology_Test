
import { useState, useEffect, useCallback } from 'react';
import { apiService, type CaseData } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useBackendCases = () => {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getCases();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setCases(response.data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        variant: "destructive",
        title: "Error loading cases",
        description: "Could not load cases from backend. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addCase = useCallback(async (caseData: Partial<CaseData>) => {
    try {
      const response = await apiService.createCase(caseData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setCases(prev => [response.data!, ...prev]);
        toast({
          title: "Case created",
          description: "New case has been added successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        variant: "destructive",
        title: "Error creating case",
        description: "Could not create new case. Please try again.",
      });
    }
  }, [toast]);

  const updateCase = useCallback(async (caseId: string, updates: Partial<CaseData>) => {
    try {
      const response = await apiService.updateCase(caseId, updates);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setCases(prev => prev.map(case_ => 
          case_.id === caseId ? response.data! : case_
        ));
        toast({
          title: "Case updated",
          description: "Case has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating case:', error);
      toast({
        variant: "destructive",
        title: "Error updating case",
        description: "Could not update case. Please try again.",
      });
    }
  }, [toast]);

  const deleteCase = useCallback(async (caseId: string) => {
    try {
      const response = await apiService.deleteCase(caseId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setCases(prev => prev.filter(case_ => case_.id !== caseId));
      toast({
        title: "Case deleted",
        description: "Case has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({
        variant: "destructive",
        title: "Error deleting case",
        description: "Could not delete case. Please try again.",
      });
    }
  }, [toast]);

  const processDicomFiles = useCallback(async () => {
    try {
      const response = await apiService.processDicomFiles();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.results) {
        setCases(prev => [...response.data!.results, ...prev]);
        toast({
          title: "DICOM files processed",
          description: `${response.data.processed} DICOM files processed successfully.`,
        });
      }
    } catch (error) {
      console.error('Error processing DICOM files:', error);
      toast({
        variant: "destructive",
        title: "Error processing DICOM files",
        description: "Could not process DICOM files. Please try again.",
      });
    }
  }, [toast]);

  const uploadImages = useCallback(async (files: File[]) => {
    try {
      const response = await apiService.uploadImages(files);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.results) {
        setCases(prev => [...response.data!.results, ...prev]);
        toast({
          title: "Images uploaded",
          description: `${response.data.count} images uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        variant: "destructive",
        title: "Error uploading images",
        description: "Could not upload images. Please try again.",
      });
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Set up auto-refresh every minute for backend cases too
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing backend cases...');
      fetchCases();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [fetchCases]);

  return {
    cases,
    loading,
    addCase,
    updateCase,
    deleteCase,
    processDicomFiles,
    uploadImages,
    refetch: fetchCases
  };
};
