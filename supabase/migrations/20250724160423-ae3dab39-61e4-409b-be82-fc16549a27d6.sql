
-- Create RLS policies for the manualuploads storage bucket
-- Allow authenticated users to insert (upload) files to their own folder
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('manualuploads', '', auth.uid(), '{}') ON CONFLICT DO NOTHING;

-- Policy to allow authenticated users to upload files to manualuploads bucket
CREATE POLICY "Allow authenticated users to upload to manualuploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'manualuploads' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to view their own uploaded files
CREATE POLICY "Allow users to view their own files in manualuploads" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'manualuploads' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Allow users to update their own files in manualuploads" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'manualuploads' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete their own files in manualuploads" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'manualuploads' 
  AND auth.role() = 'authenticated'
);
