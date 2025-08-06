-- Update existing manual upload cases that have null user_id
-- This fixes cases that were processed but didn't get the user_id set correctly
UPDATE medical_cases 
SET user_id = '4f0e91d6-f13a-4dd0-9e4f-f8d6144b7fe0',
    updated_at = now()
WHERE image_name LIKE 'manual-%' 
  AND user_id IS NULL;