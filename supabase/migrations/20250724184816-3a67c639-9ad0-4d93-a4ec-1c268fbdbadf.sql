-- Remove the trigger and function that use the net schema
DROP TRIGGER IF EXISTS trigger_process_new_dicom ON storage.objects;
DROP FUNCTION IF EXISTS public.process_new_dicom_upload();