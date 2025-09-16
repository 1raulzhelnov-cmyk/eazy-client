-- Исправляем уязвимость безопасности в таблице notifications
-- Проблема: политика "Service can insert notifications" позволяет любому создавать уведомления

-- Удаляем небезопасную политику
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Создаем более безопасные политики для вставки уведомлений

-- 1. Разрешаем создавать уведомления только сервисной роли (для edge functions)
CREATE POLICY "Service role can insert notifications" ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Проверяем, что запрос идет от сервисной роли
  auth.role() = 'service_role'
);

-- 2. Разрешаем админам создавать уведомления
CREATE POLICY "Admins can insert notifications" ON public.notifications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() 
    AND ar.is_active = true 
    AND (ar.permissions ->> 'send_notifications')::boolean = true
  )
);

-- 3. Создаем безопасную функцию для создания системных уведомлений
CREATE OR REPLACE FUNCTION public.create_system_notification(
  target_user_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  related_order_id UUID DEFAULT NULL,
  action_url_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Проверяем, что функция вызывается из контекста сервисной роли или админа
  IF auth.role() != 'service_role' AND NOT has_admin_permission('send_notifications') THEN
    RAISE EXCEPTION 'Недостаточно прав для создания уведомлений';
  END IF;

  -- Проверяем, что целевой пользователь существует
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Пользователь не найден';
  END IF;

  -- Создаем уведомление
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    order_id,
    action_url,
    created_at
  ) VALUES (
    target_user_id,
    notification_title,
    notification_message,
    notification_type,
    related_order_id,
    action_url_param,
    NOW()
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;

-- Добавляем разрешение на отправку уведомлений в права админов
DO $$
BEGIN
  -- Обновляем разрешения существующих админов
  UPDATE public.admin_roles 
  SET permissions = permissions || '{"send_notifications": true}'::jsonb
  WHERE is_active = true;
END $$;