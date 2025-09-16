-- Improve driver order access policies - only verified and active drivers
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON public.orders;
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON public.orders;

CREATE POLICY "Drivers can view assigned orders" ON public.orders 
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true 
    AND d.is_verified = true
  ))
);

CREATE POLICY "Drivers can update assigned orders" ON public.orders 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true 
    AND d.is_verified = true
  ))
);

-- Also improve chat and message access to only verified active drivers
DROP POLICY IF EXISTS "Users and drivers can view relevant chats" ON public.chats;
CREATE POLICY "Users and drivers can view relevant chats" ON public.chats 
FOR SELECT USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true 
    AND d.is_verified = true
  )) OR
  (type = 'order' AND EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.drivers d ON d.user_id = o.driver_id
    WHERE o.id = chats.order_id 
    AND o.driver_id = auth.uid()
    AND d.is_active = true 
    AND d.is_verified = true
  ))
);

DROP POLICY IF EXISTS "Users and drivers can update relevant chats" ON public.chats;
CREATE POLICY "Users and drivers can update relevant chats" ON public.chats 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (auth.uid() = driver_id AND EXISTS (
    SELECT 1 FROM public.drivers d 
    WHERE d.user_id = auth.uid() 
    AND d.is_active = true 
    AND d.is_verified = true
  )) OR
  (type = 'order' AND EXISTS (
    SELECT 1 FROM public.orders o 
    JOIN public.drivers d ON d.user_id = o.driver_id
    WHERE o.id = chats.order_id 
    AND o.driver_id = auth.uid()
    AND d.is_active = true 
    AND d.is_verified = true
  ))
);