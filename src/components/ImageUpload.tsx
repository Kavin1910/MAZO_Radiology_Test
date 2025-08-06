import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle, Loader2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: number;
  storagePath?: string;
}

interface ImageUploadProps {
  onCaseCreated?: (caseData: any) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onCaseCreated }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isProcessingWithBackend, setIsProcessingWithBackend] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
      'application/dicom': ['.dcm', '.dicom']
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting upload for file:', file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
      const filePath = fileName;

      console.log('Uploading to path:', filePath);
      
      const { data, error } = await supabase.storage
        .from('dicom-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      return filePath;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one file to upload.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    const updatedFiles = [...uploadedFiles];

    try {
      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        try {
          const storagePath = await uploadToSupabase(file.file);
          updatedFiles[i] = { ...file, storagePath };
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      }

      setUploadedFiles(updatedFiles);
      setUploadStatus('success');
      
      toast({
        title: "Upload successful",
        description: "Files have been uploaded successfully.",
      });
    } catch (error) {
      console.error('Upload process error:', error);
      setUploadStatus('error');
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Some files failed to upload. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerBackendProcessing = async (fileName: string) => {
    try {
      console.log(`Triggering backend processing for: ${fileName}`);
      setIsProcessingWithBackend(true);
      
      const response = await apiService.processDicomFile(fileName);
      
      if (response.case) {
        toast({
          title: "AI Processing Complete",
          description: `Successfully processed ${fileName} with AI analysis.`,
        });
        
        if (onCaseCreated) {
          onCaseCreated(response.case);
        }
      }
    } catch (error) {
      console.error('Error triggering backend processing:', error);
      toast({
        variant: "destructive",
        title: "Processing Error", 
        description: `Failed to process ${fileName} with AI. The file was uploaded but not analyzed.`,
      });
    } finally {
      setIsProcessingWithBackend(false);
    }
  };

  const createCase = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create a case.",
      });
      return;
    }

    if (!patientName || !patientId || uploadedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields and upload at least one file.",
      });
      return;
    }

    setIsCreatingCase(true);

    try {
      console.log('Creating case with user:', user.id);
      
      // First upload files if not already uploaded
      let filesToProcess = [...uploadedFiles];
      for (let i = 0; i < filesToProcess.length; i++) {
        if (!filesToProcess[i].storagePath) {
          try {
            const storagePath = await uploadToSupabase(filesToProcess[i].file);
            filesToProcess[i] = { ...filesToProcess[i], storagePath };
          } catch (error) {
            console.error(`Failed to upload ${filesToProcess[i].name}:`, error);
            toast({
              variant: "destructive",
              title: "Upload failed",
              description: `Failed to upload ${filesToProcess[i].name}. Please try again.`,
            });
            return;
          }
        }
      }

      // Create the medical case record
      const caseData = {
        body_part: bodyPart || 'Unknown',
        image_name: filesToProcess[0].name,
        modality: 'Unknown', 
        severity_rating: priority === 'critical' ? 95 : priority === 'high' ? 80 : priority === 'medium' ? 60 : 40,
        status: 'pending',
        radiologist_notes: clinicalFindings || 'No findings provided',
        comment: clinicalFindings || 'No additional comments',
        image_data: JSON.stringify({
          patientName,
          patientId,
          priority,
          uploadedFiles: filesToProcess.map(f => ({
            name: f.name,
            storagePath: f.storagePath
          }))
        }),
        storage_path: filesToProcess[0].storagePath,
        user_id: user.id
      };

      console.log('Inserting case data:', caseData);

      const { data, error } = await supabase
        .from('medical_cases')
        .insert([caseData])
        .select()
        .single();

      if (error) {
        console.error('Error creating case:', error);
        throw error;
      }

      console.log('Case created successfully:', data);

      // Now trigger backend processing for DICOM files
      for (const file of filesToProcess) {
        const fileName = file.storagePath;
        if (fileName && (fileName.toLowerCase().includes('.dcm') || fileName.toLowerCase().includes('.dicom'))) {
          // Don't await here - let processing happen in background
          triggerBackendProcessing(fileName);
        }
      }

      toast({
        title: "Case created successfully",
        description: `Medical case for ${patientName} has been created.${filesToProcess.some(f => f.name.toLowerCase().includes('.dcm') || f.name.toLowerCase().includes('.dicom')) ? ' DICOM files are being processed with AI...' : ''}`,
      });

      // Reset form
      setPatientName('');
      setPatientId('');
      setPriority('medium');
      setClinicalFindings('');
      setBodyPart('');
      setUploadedFiles([]);
      setUploadStatus('idle');
      setUploadProgress({});
      
      // Call callback if provided
      if (onCaseCreated) {
        onCaseCreated(data);
      }

    } catch (error: any) {
      console.error('Error creating case:', {
        message: error.message,
        details: error.details || error.toString(),
        hint: error.hint || '',
        code: error.code || ''
      });
      
      toast({
        variant: "destructive",
        title: "Error Creating Case",
        description: "Failed to save case to database. Please try again.",
      });
    } finally {
      setIsCreatingCase(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          patientName && patientId ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            patientName && patientId ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'
          }`}>1</div>
          <span className="font-medium">Patient Info</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-300 ${
          patientName && patientId ? 'bg-green-500' : 'bg-slate-300'
        }`}></div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          uploadedFiles.length > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            uploadedFiles.length > 0 ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'
          }`}>2</div>
          <span className="font-medium">Upload Images</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-300 ${
          uploadedFiles.length > 0 ? 'bg-green-500' : 'bg-slate-300'
        }`}></div>
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
          isCreatingCase || isProcessingWithBackend ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            isCreatingCase || isProcessingWithBackend ? 'bg-blue-500 text-white' : 'bg-slate-300 text-slate-600'
          }`}>3</div>
          <span className="font-medium">Create Case</span>
        </div>
      </div>

      {/* Patient Information Section */}
      <Card className="border-2 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Patient Information</h3>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">Required</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-base font-semibold text-slate-700">
                Patient Name *
              </Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter full patient name"
                className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientId" className="text-base font-semibold text-slate-700">
                Patient ID *
              </Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter unique patient ID"
                className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyPart" className="text-base font-semibold text-slate-700">
                Body Part
              </Label>
              <Input
                id="bodyPart"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                placeholder="e.g., Chest, Head, Spine, Abdomen"
                className="h-12 text-base border-2 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-base font-semibold text-slate-700">
                Priority Level
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-12 text-base border-2 focus:border-blue-500">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="high">🟠 High Priority</SelectItem>
                  <SelectItem value="critical">🔴 Critical Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <Label htmlFor="clinicalFindings" className="text-base font-semibold text-slate-700">
              Clinical Findings & Notes
            </Label>
            <Textarea
              id="clinicalFindings"
              value={clinicalFindings}
              onChange={(e) => setClinicalFindings(e.target.value)}
              placeholder="Enter clinical findings, symptoms, medical history, or additional notes that may help with the diagnosis..."
              className="min-h-[100px] text-base border-2 focus:border-blue-500 transition-all duration-200"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="border-2 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Medical Images</h3>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>
          
          <div
            {...getRootProps()}
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 group ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-500 bg-red-50'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="flex flex-col items-center space-y-4">
              <div className={`relative transition-all duration-500 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {uploadStatus === 'uploading' ? (
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                  </div>
                ) : uploadStatus === 'success' ? (
                  <div className="relative">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <div className="absolute -inset-2 bg-green-100 rounded-full -z-10 animate-pulse"></div>
                  </div>
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                ) : (
                  <div className="relative">
                    <Upload className="h-16 w-16 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                    <div className="absolute -inset-3 bg-blue-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-800">
                  {isDragActive
                    ? '📁 Drop the files here...'
                    : uploadStatus === 'success'
                    ? '✅ Upload successful!'
                    : uploadStatus === 'uploading'
                    ? '⏳ Uploading files...'
                    : '📤 Drag & drop medical images here'}
                </p>
                <p className="text-base text-slate-600">
                  or <span className="text-blue-600 font-semibold underline">click to browse</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline" className="bg-white">DICOM (.dcm)</Badge>
                  <Badge variant="outline" className="bg-white">JPEG (.jpg)</Badge>
                  <Badge variant="outline" className="bg-white">PNG (.png)</Badge>
                  <Badge variant="outline" className="bg-white">Max 100MB each</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-800">
                  📋 Uploaded Files ({uploadedFiles.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadedFiles([])}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="group p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative p-2 bg-blue-100 rounded-lg">
                          <Upload className="h-5 w-5 text-blue-600" />
                          {uploadProgress[file.name] === 100 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                          <p className="text-sm text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {uploadProgress[file.name] !== undefined && (
                          <div className="text-sm font-medium">
                            {uploadProgress[file.name] === -1 ? (
                              <span className="text-red-500 flex items-center">
                                <X className="h-4 w-4 mr-1" />
                                Failed
                              </span>
                            ) : uploadProgress[file.name] === 100 ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Done
                              </span>
                            ) : (
                              <span className="text-blue-500">{uploadProgress[file.name]}%</span>
                            )}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            {uploadedFiles.length > 0 && uploadStatus !== 'success' && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2 hover:border-blue-500 hover:bg-blue-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading Files...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Files to Storage
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={createCase}
              disabled={isCreatingCase || isProcessingWithBackend || !patientName || !patientId || uploadedFiles.length === 0}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isCreatingCase ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Case...
                </>
              ) : isProcessingWithBackend ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Create Medical Case
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {uploadStatus === 'error' && (
        <Alert variant="destructive" className="border-2 border-red-300 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">
            ⚠️ Some files failed to upload. Please check your internet connection and try again.
          </AlertDescription>
        </Alert>
      )}

      {isProcessingWithBackend && (
        <Alert className="border-2 border-blue-300 bg-blue-50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <AlertDescription className="text-base">
            🤖 AI is processing your DICOM files. This may take a few moments...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUpload;
