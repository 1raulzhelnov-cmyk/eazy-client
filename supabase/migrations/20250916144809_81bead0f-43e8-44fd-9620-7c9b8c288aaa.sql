-- Create admin roles system for proper access control
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB NOT NULL DEFAULT '{"view_applications": true, "approve_applications": true, "view_drivers": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on admin_roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_roles (only super admins can manage)
CREATE POLICY "Admins can view admin roles" ON public.admin_roles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.is_active = true
  )
);

CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() 
    AND ar.is_active = true 
    AND ar.permissions->>'manage_admins' = 'true'
  )
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Function to check specific admin permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND (permissions->>permission_key)::boolean = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Function to check if user is driver
CREATE OR REPLACE FUNCTION public.is_driver(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.drivers 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Add updated_at trigger for admin_roles
CREATE TRIGGER update_admin_roles_updated_at
BEFORE UPDATE ON public.admin_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update driver_applications RLS policies to include admin access
DROP POLICY IF EXISTS "Users can view their own applications" ON public.driver_applications;
CREATE POLICY "Users and admins can view applications" ON public.driver_applications 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_applications')
);

-- Update RLS policy for updating applications (only admins can update approved/rejected)
DROP POLICY IF EXISTS "Users can update their pending applications" ON public.driver_applications;
CREATE POLICY "Users can update pending, admins can update any" ON public.driver_applications 
FOR UPDATE USING (
  (auth.uid() = user_id AND status = 'pending'::text) OR 
  public.has_admin_permission('approve_applications')
);

-- Update drivers table RLS policies
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.drivers;
CREATE POLICY "Drivers and admins can view driver profiles" ON public.drivers 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_drivers')
);

-- Allow drivers to access orders assigned to them
CREATE POLICY "Drivers can view assigned orders" ON public.orders 
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND public.is_driver())
);

CREATE POLICY "Drivers can update assigned orders" ON public.orders 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND public.is_driver())
);

-- Allow drivers to access chats for their orders
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
CREATE POLICY "Users and drivers can view relevant chats" ON public.chats 
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND public.is_driver()) OR
  (type = 'order' AND EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = chats.order_id AND o.driver_id = auth.uid()
  ))
);

DROP POLICY IF EXISTS "Users can update their own chats" ON public.chats;
CREATE POLICY "Users and drivers can update relevant chats" ON public.chats 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND public.is_driver()) OR
  (type = 'order' AND EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = chats.order_id AND o.driver_id = auth.uid()
  ))
);

-- Allow drivers to send messages in order chats
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.messages;
CREATE POLICY "Users and drivers can send messages in relevant chats" ON public.messages 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats c 
    WHERE c.id = messages.chat_id AND (
      c.user_id = auth.uid() OR
      (c.driver_id = auth.uid() AND public.is_driver()) OR
      (c.type = 'order' AND EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = c.order_id AND o.driver_id = auth.uid()
      ))
    )
  )
);

DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
CREATE POLICY "Users and drivers can view messages in relevant chats" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chats c 
    WHERE c.id = messages.chat_id AND (
      c.user_id = auth.uid() OR
      (c.driver_id = auth.uid() AND public.is_driver()) OR
      (c.type = 'order' AND EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = c.order_id AND o.driver_id = auth.uid()
      ))
    )
  )
);

-- Secure user analytics - only user and authorized analytics staff
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;
CREATE POLICY "Users and analytics admins can view analytics" ON public.user_analytics 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_analytics')
);

-- Update storage policies for driver-documents bucket to include admin access
CREATE POLICY "Admins can view all driver documents" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'driver-documents' AND public.has_admin_permission('view_applications')
);

-- Insert initial super admin (will need to be set manually)
-- This creates a placeholder that needs to be updated with actual admin user ID
INSERT INTO public.admin_roles (user_id, role, permissions, created_by) 
VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID, 
  'super_admin',
  '{"view_applications": true, "approve_applications": true, "view_drivers": true, "view_analytics": true, "manage_admins": true}'::JSONB,
  '00000000-0000-0000-0000-000000000000'::UUID
) ON CONFLICT (user_id) DO NOTHING;