import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedImageUploadProps {
  onUploadComplete?: () => void;
  title?: string;
}

export const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onUploadComplete,
  title = "Medical Image Upload"
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFileToStorage = async (file: File): Promise<string> => {
    try {
      console.log(`📤 Starting storage upload for: ${file.name}`);
      
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 100MB.');
      }
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error('Authentication failed');
      }
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Create filename with manual prefix and timestamp
      const fileName = `manual-${Date.now()}-${file.name}`;
      
      console.log(`📁 Uploading to dicom-files bucket as: ${fileName}`);
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('dicom-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      
      console.log(`✅ File uploaded to storage: ${fileName}`);
      return fileName;
      
    } catch (error) {
      console.error('Error in uploadFileToStorage:', error);
      throw error;
    }
  };


  const processFile = async (file: File) => {
    try {
      // Upload to Supabase Storage only - no backend processing
      const fileName = await uploadFileToStorage(file);
      
      console.log(`🎉 Successfully uploaded file to storage: ${file.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to upload file ${file.name}:`, error);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('📂 Files dropped:', acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file sequentially
    let processedCount = 0;
    let failedCount = 0;
    
    for (const file of acceptedFiles) {
      try {
        await processFile(file);
        processedCount++;
      } catch (error) {
        failedCount++;
        console.error(`Failed to process ${file.name}:`, error);
      }
    }
    
    setIsUploading(false);
    
    // Show summary toast and notify parent
    if (processedCount > 0) {
      toast({
        title: "Files uploaded successfully",
        description: `Successfully uploaded ${processedCount} file(s) to storage${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
      });
      onUploadComplete?.();
    }
    
  }, [onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
      'application/dicom': ['.dcm', '.dicom']
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: isUploading
  });

  return (
    <div className="space-y-8">
      <Card className="border-2 hover:border-blue-200 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
          </div>

          <div
            {...getRootProps()}
            className={`relative border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 group ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
            } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <div className="flex flex-col items-center space-y-4">
              <div className={`relative transition-all duration-500 ${isDragActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Upload className="h-16 w-16 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" />
                <div className="absolute -inset-3 bg-blue-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-800">
                  {isUploading
                    ? '⏳ Uploading files...'
                    : isDragActive
                    ? '📁 Drop the files here...'
                    : '📤 Drag & drop medical images here'}
                </p>
                <p className="text-base text-slate-600">
                  {isUploading 
                    ? 'Files are being uploaded to storage'
                    : <>or <span className="text-blue-600 font-semibold underline">click to browse</span></>
                  }
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

          {/* Processing Info */}
          {isUploading && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="text-blue-700 font-medium">Uploading medical images...</p>
                  <p className="text-blue-600 text-sm">Files are being uploaded to your storage bucket.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};