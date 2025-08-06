-- Update all existing status values to match the new schema first
-- Update 'pending' to 'open'
UPDATE public.medical_cases 
SET status = 'open' 
WHERE status = 'pending';

-- Update 'in-review' to 'in-progress'
UPDATE public.medical_cases 
SET status = 'in-progress' 
WHERE status = 'in-review';

-- Update 'review-complete' to 'review-completed' 
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'review-complete';

-- Now add the check constraint that allows the three requested status values
ALTER TABLE public.medical_cases 
ADD CONSTRAINT medical_cases_status_check 
CHECK (status IN ('open', 'in-progress', 'review-completed'));

-- Update the default value for new records
ALTER TABLE public.medical_cases 
ALTER COLUMN status SET DEFAULT 'open';