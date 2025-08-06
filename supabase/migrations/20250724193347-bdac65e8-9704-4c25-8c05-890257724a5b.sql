-- Update any remaining manual files that are still marked as system
UPDATE medical_cases 
SET source = 'manual' 
WHERE (image_name ILIKE '%manual%' OR storage_path ILIKE '%manual%')
AND source = 'system';

-- Also update any files that have a user_id but are marked as system (likely manual uploads)
UPDATE medical_cases 
SET source = 'manual' 
WHERE user_id IS NOT NULL 
AND source = 'system';