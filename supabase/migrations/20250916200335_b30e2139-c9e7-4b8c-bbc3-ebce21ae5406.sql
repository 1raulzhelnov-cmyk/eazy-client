-- Phase 1: Critical PII and Document Protection
-- Create secure RLS policies for driver documents storage

BEGIN;

-- 1. Create RLS policies for driver-documents storage bucket
CREATE POLICY "Drivers can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND is_driver()
);

CREATE POLICY "Drivers can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'driver-documents' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1] 
    OR has_admin_permission('view_driver_documents')
  )
);

CREATE POLICY "Drivers can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND is_driver()
);

CREATE POLICY "Admins can delete driver documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'driver-documents' 
  AND has_admin_permission('manage_driver_documents')
);

-- 2. Create secure function for admin document access
CREATE OR REPLACE FUNCTION public.admin_get_driver_document(
  driver_user_id UUID,
  document_type TEXT
) 
RETURNS TABLE (
  file_path TEXT,
  file_name TEXT,
  content_type TEXT,
  size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public, storage
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check admin permissions
  IF NOT has_admin_permission('view_driver_documents') THEN
    RAISE EXCEPTION 'Insufficient permissions to access driver documents';
  END IF;

  -- Audit the access
  PERFORM audit_data_access(
    'view_document',
    'driver_document',
    driver_user_id::text,
    jsonb_build_object('document_type', document_type)
  );

  -- Return document info (not content for security)
  RETURN QUERY
  SELECT 
    obj.name as file_path,
    split_part(obj.name, '/', -1) as file_name,
    obj.metadata->>'mimetype' as content_type,
    obj.metadata->>'size'::bigint as size,
    obj.created_at
  FROM storage.objects obj
  WHERE obj.bucket_id = 'driver-documents'
    AND obj.name LIKE driver_user_id::text || '/' || document_type || '%'
  ORDER BY obj.created_at DESC;
END;
$$;

-- 3. Update admin permissions for granular access control
-- Add new permission fields to existing admin roles
UPDATE admin_roles 
SET permissions = permissions || jsonb_build_object(
  'view_driver_documents', CASE 
    WHEN (permissions->>'view_drivers')::boolean = true THEN true 
    ELSE false 
  END,
  'manage_driver_documents', false,
  'view_analytics', false,
  'view_audit_logs', false,
  'view_user_data', false,
  'manage_security', false
)
WHERE permissions IS NOT NULL;

-- 4. Create function to check document access for specific driver
CREATE OR REPLACE FUNCTION public.can_access_driver_document(
  driver_user_id UUID,
  document_path TEXT
) 
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Driver can access their own documents
  IF auth.uid() = driver_user_id AND is_driver() THEN
    RETURN true;
  END IF;
  
  -- Admin with proper permissions can access
  IF has_admin_permission('view_driver_documents') THEN
    -- Log the admin access
    PERFORM audit_data_access(
      'admin_document_access',
      'driver_document',
      driver_user_id::text,
      jsonb_build_object('document_path', document_path)
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 5. Create audit trigger for driver document access
CREATE OR REPLACE FUNCTION public.audit_driver_document_access()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only audit access to driver-documents bucket
  IF NEW.bucket_id = 'driver-documents' AND TG_OP = 'SELECT' THEN
    PERFORM audit_data_access(
      'document_accessed',
      'driver_document',
      split_part(NEW.name, '/', 1), -- driver_user_id from path
      jsonb_build_object(
        'document_path', NEW.name,
        'operation', TG_OP
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

COMMIT;