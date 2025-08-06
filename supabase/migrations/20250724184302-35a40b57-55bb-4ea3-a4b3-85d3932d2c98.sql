-- Remove the problematic trigger that uses the net schema
DROP TRIGGER IF EXISTS on_dicom_file_upload ON storage.objects;