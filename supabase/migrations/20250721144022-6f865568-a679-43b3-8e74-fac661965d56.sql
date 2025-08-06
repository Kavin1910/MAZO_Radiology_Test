
-- Update RLS policies to allow users to see system-processed cases (user_id = NULL)
-- and also allow backend to insert cases without user_id

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own medical cases" ON public.medical_cases;
DROP POLICY IF EXISTS "Users can insert their own medical cases" ON public.medical_cases;
DROP POLICY IF EXISTS "Users can update their own medical cases" ON public.medical_cases;
DROP POLICY IF EXISTS "Users can delete their own medical cases" ON public.medical_cases;

-- Create new policies that handle both user cases and system cases
CREATE POLICY "Users can view their own cases and system cases" 
  ON public.medical_cases 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own cases" 
  ON public.medical_cases 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Backend can insert system cases" 
  ON public.medical_cases 
  FOR INSERT 
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can update their own cases and system cases" 
  ON public.medical_cases 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own cases and system cases" 
  ON public.medical_cases 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);
