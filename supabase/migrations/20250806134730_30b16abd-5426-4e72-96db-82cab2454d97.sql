-- Fix source field for medical cases based on image name
-- If image_name contains 'manual', set source to 'manual'
-- Otherwise, ensure source is 'system'

UPDATE medical_cases 
SET source = 'manual', updated_at = now()
WHERE image_name ILIKE '%manual%' 
AND source != 'manual';

-- Also ensure any records without 'manual' in the name have source as 'system'
UPDATE medical_cases 
SET source = 'system', updated_at = now()
WHERE image_name NOT ILIKE '%manual%' 
AND source != 'system';