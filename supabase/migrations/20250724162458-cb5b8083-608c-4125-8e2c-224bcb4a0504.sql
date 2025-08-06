
-- Add the missing 'source' column to the medical_cases table
ALTER TABLE public.medical_cases 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'system' CHECK (source IN ('manual', 'system'));

-- Update existing records to have a source value based on image_name prefix
UPDATE public.medical_cases 
SET source = CASE 
  WHEN image_name LIKE 'manual-%' THEN 'manual'
  ELSE 'system'
END
WHERE source IS NULL;
