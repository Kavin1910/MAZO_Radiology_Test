-- Fix this new manual file that's incorrectly marked as system
UPDATE medical_cases 
SET source = 'manual' 
WHERE id = '19e60920-a34f-42d4-9608-049a61740d4b';

-- Fix ALL manual files that are still marked as system
UPDATE medical_cases 
SET source = 'manual' 
WHERE image_name LIKE 'manual-%' 
AND source = 'system';