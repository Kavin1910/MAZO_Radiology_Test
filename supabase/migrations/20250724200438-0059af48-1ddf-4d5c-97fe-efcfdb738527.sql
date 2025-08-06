-- Fix manual upload files that are incorrectly marked as 'system'
UPDATE medical_cases 
SET source = 'manual' 
WHERE image_name LIKE 'manual-%' 
AND source = 'system';