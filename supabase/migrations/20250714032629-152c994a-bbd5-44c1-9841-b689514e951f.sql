-- Check and drop any existing check constraints on the status column
DO $$ 
BEGIN
    -- Drop constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'medical_cases_status_check' 
        AND table_name = 'medical_cases'
    ) THEN
        ALTER TABLE public.medical_cases DROP CONSTRAINT medical_cases_status_check;
    END IF;
END $$;

-- Update all existing status values to match the new schema
UPDATE public.medical_cases 
SET status = CASE 
    WHEN status = 'pending' THEN 'open'
    WHEN status = 'in-review' THEN 'in-progress'
    WHEN status = 'review-complete' THEN 'review-completed'
    ELSE status
END
WHERE status IN ('pending', 'in-review', 'review-complete');

-- Update the default value for new records
ALTER TABLE public.medical_cases 
ALTER COLUMN status SET DEFAULT 'open';