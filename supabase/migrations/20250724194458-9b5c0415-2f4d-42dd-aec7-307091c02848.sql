-- Fix the specific case that's showing in the logs
UPDATE medical_cases 
SET source = 'manual' 
WHERE id = 'd92ddbaa-90f4-4e04-876e-7f024adba2fe';

-- Also update any other manual files that might have been created recently
UPDATE medical_cases 
SET source = 'manual' 
WHERE image_name LIKE 'manual-%' 
AND source = 'system';