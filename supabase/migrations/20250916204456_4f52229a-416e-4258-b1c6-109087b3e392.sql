-- Security audit and fix for profiles table

-- First, let's check if there are any security gaps in the profiles table RLS policies
-- The profiles table contains sensitive PII data and must be secured properly

-- Test current security status
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class 
WHERE relname = 'profiles';

-- Check for any potential public access
SELECT 
  pol.polname,
  pol.polcmd,
  pg_get_expr(pol.polqual, pol.polrelid) as using_condition,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_condition
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'profiles';

-- Ensure RLS is properly enforced
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Drop any existing policies that might be problematic
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create strict RLS policies that ensure only authenticated users can access their own data
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Add additional security: ensure user_id cannot be NULL (prevents data leaks)
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Create index for better performance while maintaining security
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add audit trigger for profile access logging
CREATE OR REPLACE FUNCTION audit_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log profile access for security monitoring
  INSERT INTO security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    'profile',
    COALESCE(NEW.user_id, OLD.user_id)::text,
    jsonb_build_object(
      'table', 'profiles',
      'timestamp', now()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger
DROP TRIGGER IF EXISTS audit_profile_access_trigger ON public.profiles;
CREATE TRIGGER audit_profile_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION audit_profile_access();

-- Security validation query
SELECT 
  'SECURITY CHECK: profiles table' as check_name,
  CASE 
    WHEN relrowsecurity AND relforcerowsecurity THEN 'SECURE: RLS enabled and forced'
    WHEN relrowsecurity THEN 'WARNING: RLS enabled but not forced'
    ELSE 'CRITICAL: RLS not enabled'
  END as status
FROM pg_class 
WHERE relname = 'profiles';