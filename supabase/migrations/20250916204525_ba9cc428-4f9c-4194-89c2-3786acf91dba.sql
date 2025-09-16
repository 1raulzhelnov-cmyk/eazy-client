-- Fix security warning: Function Search Path Mutable
-- Update the audit_profile_access function to have a secure search path

CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Log profile access for security monitoring
  INSERT INTO public.security_audit_log (
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
$$;