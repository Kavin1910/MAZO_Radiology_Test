
-- Enable real-time notifications for storage object changes
-- This will allow us to listen for new file uploads instantly

-- First, ensure the storage.objects table has replica identity for real-time updates
ALTER TABLE storage.objects REPLICA IDENTITY FULL;

-- Add the storage.objects table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE storage.objects;

-- Create a function to notify about new DICOM uploads
CREATE OR REPLACE FUNCTION notify_new_dicom_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for DICOM files in the dicom-files bucket
  IF NEW.bucket_id = 'dicom-files' AND 
     (NEW.name ILIKE '%.dcm' OR NEW.name ILIKE '%.dicom') THEN
    
    -- Send a notification with the file details
    PERFORM pg_notify(
      'new_dicom_file', 
      json_build_object(
        'bucket_id', NEW.bucket_id,
        'name', NEW.name,
        'id', NEW.id,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new file uploads
DROP TRIGGER IF EXISTS on_dicom_upload ON storage.objects;
CREATE TRIGGER on_dicom_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_dicom_upload();
