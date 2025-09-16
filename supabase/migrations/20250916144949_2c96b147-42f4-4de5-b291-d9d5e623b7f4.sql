-- Allow drivers to send messages in order chats
DROP POLICY IF EXISTS "Users can send messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users and drivers can send messages in relevant chats" ON public.messages;
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
DROP POLICY IF EXISTS "Users and drivers can view messages in relevant chats" ON public.messages;
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
DROP POLICY IF EXISTS "Users and analytics admins can view analytics" ON public.user_analytics;
CREATE POLICY "Users and analytics admins can view analytics" ON public.user_analytics 
FOR SELECT USING (
  auth.uid() = user_id OR public.has_admin_permission('view_analytics')
);

-- Update storage policies for driver-documents bucket to include admin access
DROP POLICY IF EXISTS "Admins can view all driver documents" ON storage.objects;
CREATE POLICY "Admins can view all driver documents" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'driver-documents' AND public.has_admin_permission('view_applications')
);