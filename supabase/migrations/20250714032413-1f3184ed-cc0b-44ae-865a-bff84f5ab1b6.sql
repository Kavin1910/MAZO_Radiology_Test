-- Update medical_cases table to support the new case statuses
-- First, let's check what current status values we have and update them to match the new requirements

-- Update any existing 'pending' status to 'open'
UPDATE public.medical_cases 
SET status = 'open' 
WHERE status = 'pending';

-- Update any 'review-complete' status to 'review-completed' 
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'review-complete';

-- Update any 'pending-review' status to 'review-completed' to match the new naming
UPDATE public.medical_cases 
SET status = 'review-completed' 
WHERE status = 'pending-review';

-- Note: The table already supports text status values, so no schema changes needed
-- The existing statuses will be:
-- 'open' - Case is created but not yet reviewed
-- 'in-progress' - Case is currently being reviewed by a radiologist  
-- 'review-completed' - Case has been fully reviewed and finalized