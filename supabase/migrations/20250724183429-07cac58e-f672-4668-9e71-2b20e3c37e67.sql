-- Create trigger to process new DICOM file uploads
CREATE OR REPLACE TRIGGER on_dicom_file_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'dicom-files')
  EXECUTE FUNCTION public.process_new_dicom_upload();