-- Fix driver profile access - ensure drivers can ONLY see their own data
-- Drop the existing policy and create a more explicit one
DROP POLICY IF EXISTS "Drivers and admins can view driver profiles" ON public.drivers;

-- Create separate policies for clarity and security
CREATE POLICY "Drivers can view only their own profile" ON public.drivers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Separate policy for admins with explicit permission check
CREATE POLICY "Admins can view all driver profiles" ON public.drivers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() 
    AND ar.is_active = true 
    AND (ar.permissions ->> 'view_drivers')::boolean = true
  )
);

-- Ensure the update policy is also restrictive to own data only
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.drivers;
CREATE POLICY "Drivers can update only their own profile" ON public.drivers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure insert policy is also restrictive 
DROP POLICY IF EXISTS "Drivers can insert their own profile" ON public.drivers;
CREATE POLICY "Drivers can insert only their own profile" ON public.drivers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);