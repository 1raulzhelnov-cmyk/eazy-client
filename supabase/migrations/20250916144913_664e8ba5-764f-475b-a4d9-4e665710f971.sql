-- Update driver_applications RLS policies to include admin access
DROP POLICY IF EXISTS "Users can view their own applications" ON public.driver_applications;
DROP POLICY IF EXISTS "Users and admins can view applications" ON public.driver_applications;
CREATE POLICY "Users and admins can view applications" ON public.driver_applications 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_applications')
);

-- Update RLS policy for updating applications (only admins can update approved/rejected)
DROP POLICY IF EXISTS "Users can update their pending applications" ON public.driver_applications;
DROP POLICY IF EXISTS "Users can update pending, admins can update any" ON public.driver_applications;
CREATE POLICY "Users can update pending, admins can update any" ON public.driver_applications 
FOR UPDATE USING (
  (auth.uid() = user_id AND status = 'pending'::text) OR 
  public.has_admin_permission('approve_applications')
);

-- Update drivers table RLS policies
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.drivers;
DROP POLICY IF EXISTS "Drivers and admins can view driver profiles" ON public.drivers;
CREATE POLICY "Drivers and admins can view driver profiles" ON public.drivers 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_drivers')
);

-- Allow drivers to access orders assigned to them
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

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
DROP POLICY IF EXISTS "Users and drivers can view relevant chats" ON public.chats;
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
DROP POLICY IF EXISTS "Users and drivers can update relevant chats" ON public.chats;
CREATE POLICY "Users and drivers can update relevant chats" ON public.chats 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND public.is_driver()) OR
  (type = 'order' AND EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = chats.order_id AND o.driver_id = auth.uid()
  ))
);