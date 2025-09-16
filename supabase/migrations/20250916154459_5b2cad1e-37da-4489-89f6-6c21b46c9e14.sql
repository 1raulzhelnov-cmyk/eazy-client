-- ЭТАП 1 и 3: Исправление утечки данных водителей и бесконечной рекурсии RLS

-- Создаем security definer функции для разрыва рекурсии
CREATE OR REPLACE FUNCTION public.check_user_owns_order_with_driver(order_user_id uuid, driver_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = order_user_id
    AND o.driver_id = driver_user_id
    AND o.status IN ('accepted', 'preparing', 'ready', 'picked_up', 'in_transit')
  );
END;
$$;

-- Функция для проверки активности водителя без рекурсии
CREATE OR REPLACE FUNCTION public.is_active_verified_driver(driver_user_id uuid)
RETURNS boolean  
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM drivers d
    WHERE d.user_id = driver_user_id 
    AND d.is_active = true 
    AND d.is_verified = true
  );
END;
$$;

-- Безопасная функция для получения только базовой информации о водителе
CREATE OR REPLACE FUNCTION public.get_safe_driver_info_only(driver_user_id uuid)
RETURNS TABLE(
  driver_id uuid,
  first_name text,
  last_name_initial text,
  rating numeric,
  vehicle_type text,
  status text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Проверяем что пользователь имеет право видеть этого водителя
  IF NOT check_user_owns_order_with_driver(auth.uid(), driver_user_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    d.user_id as driver_id,
    d.first_name,
    LEFT(d.last_name, 1) || '.' as last_name_initial,
    d.rating,
    d.vehicle_type,
    d.status
  FROM drivers d
  WHERE d.user_id = driver_user_id
  AND d.is_active = true 
  AND d.is_verified = true;
END;
$$;

-- Удаляем старые проблемные политики RLS
DROP POLICY IF EXISTS "Users can view minimal driver info for active orders only" ON drivers;
DROP POLICY IF EXISTS "Drivers can view assigned orders" ON drivers; 
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON orders;

-- Создаем новые безопасные политики для drivers без рекурсии
CREATE POLICY "Drivers can only view own profile" 
ON drivers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can only update own profile" 
ON drivers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can only insert own profile" 
ON drivers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers" 
ON drivers 
FOR SELECT 
USING (check_admin_permission('view_drivers'));

-- Создаем новые безопасные политики для orders без рекурсии
CREATE POLICY "Users can view own orders only" 
ON orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own orders only" 
ON orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Active verified drivers can view assigned orders" 
ON orders 
FOR SELECT 
USING (
  auth.uid() = driver_id 
  AND is_active_verified_driver(auth.uid())
);

CREATE POLICY "Active verified drivers can update assigned orders" 
ON orders 
FOR UPDATE 
USING (
  auth.uid() = driver_id 
  AND is_active_verified_driver(auth.uid())
);

-- ЭТАП 2: Защита документов водителей
-- Создаем приватный bucket для документов (если не существует)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('driver-documents-secure', 'Driver Documents Secure', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Политики для приватного bucket документов
CREATE POLICY "Drivers can upload own documents only" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'driver-documents-secure' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Drivers can view own documents only" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'driver-documents-secure' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all driver documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'driver-documents-secure' 
  AND check_admin_permission('view_applications')
);

-- Функция для генерации подписанных URL с ограниченным временем
CREATE OR REPLACE FUNCTION public.get_signed_document_url(
  file_path text,
  expires_in_seconds integer DEFAULT 3600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  signed_url text;
BEGIN
  -- Проверяем что пользователь имеет право на доступ к документу
  IF NOT (
    auth.uid()::text = (string_to_array(file_path, '/'))[1] OR
    check_admin_permission('view_applications')
  ) THEN
    RAISE EXCEPTION 'Access denied to document';
  END IF;

  -- Генерируем подписанный URL (это псевдокод, в реальности нужна интеграция с Supabase Storage API)
  SELECT storage.get_signed_url('driver-documents-secure', file_path, expires_in_seconds) INTO signed_url;
  
  RETURN signed_url;
END;
$$;