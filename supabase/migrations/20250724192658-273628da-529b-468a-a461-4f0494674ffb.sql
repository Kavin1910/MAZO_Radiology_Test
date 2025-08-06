-- Update the specific file and any other manual files that are still marked as system
UPDATE medical_cases 
SET source = 'manual' 
WHERE image_name ILIKE '%manual%' 
AND source = 'system';