-- Update existing records that have 'manual' in their image_name but are marked as 'system'
UPDATE medical_cases 
SET source = 'manual' 
WHERE image_name ILIKE '%manual%' 
AND source = 'system';