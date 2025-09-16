-- Исправление критических уязвимостей безопасности

-- 1. Исправляем бесконечную рекурсию в admin_roles
-- Создаем функцию безопасности для проверки админских прав
CREATE OR REPLACE FUNCTION public.check_is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Простая проверка без рекурсии
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$;

-- Создаем функцию для проверки конкретных разрешений
CREATE OR REPLACE FUNCTION public.check_admin_permission(permission_key text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid 
    AND is_active = true 
    AND (permissions->>permission_key)::boolean = true
  );
END;
$$;

-- Обновляем политики admin_roles для устранения рекурсии
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

CREATE POLICY "Admins can view admin roles"
ON public.admin_roles
FOR SELECT
TO authenticated
USING (check_is_admin());

CREATE POLICY "Super admins can manage admin roles"
ON public.admin_roles
FOR ALL
TO authenticated
USING (check_admin_permission('manage_admins'));

-- 2. Исправляем уязвимости в таблице recommendations
DROP POLICY IF EXISTS "Service can insert recommendations" ON public.recommendations;

CREATE POLICY "Only service role can insert recommendations"
ON public.recommendations
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Исправляем уязвимости в таблице push_notifications  
DROP POLICY IF EXISTS "Service can create notifications" ON public.push_notifications;

CREATE POLICY "Only service role can insert push notifications"
ON public.push_notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- Добавляем политику для админов с правами на отправку уведомлений
CREATE POLICY "Admins can insert push notifications"
ON public.push_notifications
FOR INSERT
TO authenticated
WITH CHECK (check_admin_permission('send_notifications'));

-- 4. Обновляем функции безопасности для использования новых функций проверки
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN check_is_admin(user_uuid);
END;
$$;

CREATE OR REPLACE FUNCTION public.has_admin_permission(permission_key text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN check_admin_permission(permission_key, user_uuid);
END;
$$;