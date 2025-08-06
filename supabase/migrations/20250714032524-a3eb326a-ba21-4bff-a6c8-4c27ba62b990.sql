-- First, let's drop the existing check constraint if it exists
ALTER TABLE public.medical_cases 
DROP CONSTRAINT IF EXISTS medical_cases_status_check;

-- Add a new check constraint that allows the three requested status values
ALTER TABLE public.medical_cases 
ADD CONSTRAINT medical_cases_status_check 
CHECK (status IN ('open', 'in-progress', 'review-completed'));

-- Now update any existing status values to match the new schema
-- Update 'pending' to 'open'
UPDATE public.medical_cases 
SET status = 'open' 
WHERE status = 'pending';

-- Update 'review-complete' to 'review-completed' 
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'review-complete';

-- Update 'pending-review' to 'review-completed'
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'pending-review';

-- Update 'closed' to 'review-completed' 
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'closed';

-- Update the default value for new records
ALTER TABLE public.medical_cases 
ALTER COLUMN status SET DEFAULT 'open';