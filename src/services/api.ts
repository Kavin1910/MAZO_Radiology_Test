
export interface CaseData {
  id: string;
  patientName: string;
  patientId: string;
  imageType: 'MRI' | 'CT';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'review-completed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  findings?: string;
  aiConfidence: number;
  bodyPart: string;
  modality?: string;
  confidence_score?: number;
  patient_name?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  processed?: number;
  count?: number;
}

export const apiService = {
  healthCheck: async (): Promise<ApiResponse> => {
    try {
      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling health check API:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  getCases: async (): Promise<ApiResponse<CaseData[]>> => {
    try {
      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/cases', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cases:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  createCase: async (caseData: Partial<CaseData>): Promise<ApiResponse<CaseData>> => {
    try {
      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating case:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  updateCase: async (caseId: string, updates: Partial<CaseData>): Promise<ApiResponse<CaseData>> => {
    try {
      const response = await fetch(`https://august-terminus-462709-i3.onrender.com/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating case:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  deleteCase: async (caseId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`https://august-terminus-462709-i3.onrender.com/api/cases/${caseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting case:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  processDicomFiles: async (): Promise<ApiResponse<{ results: CaseData[]; processed: number }>> => {
    try {
      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/process-dicom-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing DICOM files:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  processDicomFile: async (fileName: string) => {
    try {
      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/process-dicom-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling backend API:', error);
      throw error;
    }
  },

  uploadImages: async (files: File[]): Promise<ApiResponse<{ results: CaseData[]; count: number }>> => {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading images:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  processUploadedImage: async (fileName: string, fileData: File): Promise<ApiResponse<CaseData>> => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      formData.append('fileName', fileName);

      const response = await fetch('https://august-terminus-462709-i3.onrender.com/api/process-uploaded-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing uploaded image:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};
