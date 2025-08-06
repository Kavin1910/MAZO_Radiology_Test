-- Fix all manual files that are incorrectly marked as system
-- This specifically targets the filename pattern for manual uploads
UPDATE medical_cases 
SET source = 'manual' 
WHERE (image_name LIKE 'manual-%' OR storage_path LIKE 'manual-%')
AND source != 'manual';