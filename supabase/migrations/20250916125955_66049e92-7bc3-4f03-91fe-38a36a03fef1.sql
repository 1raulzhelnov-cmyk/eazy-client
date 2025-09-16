-- Исправляем предупреждения безопасности для функций
DROP FUNCTION IF EXISTS public.update_loyalty_points();
DROP FUNCTION IF EXISTS public.initialize_user_data();

-- Функция для обновления баллов лояльности при заказе (с правильным search_path)
CREATE OR REPLACE FUNCTION public.update_loyalty_points()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Обновляем баллы лояльности при создании заказа
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    INSERT INTO public.loyalty_program (user_id, points, total_spent, total_orders)
    VALUES (NEW.user_id, FLOOR(NEW.total_amount), NEW.total_amount, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = loyalty_program.points + FLOOR(NEW.total_amount),
      total_spent = loyalty_program.total_spent + NEW.total_amount,
      total_orders = loyalty_program.total_orders + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Функция для создания начальных настроек пользователя (с правильным search_path)
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Создаем начальные предпочтения пользователя
  INSERT INTO public.user_preferences (user_id, preferences, privacy_settings, notification_settings)
  VALUES (
    NEW.user_id,
    '{"language": "ru", "currency": "EUR", "theme": "light"}',
    '{"shareLocation": true, "orderHistory": true, "personalizedAds": false, "dataCollection": false}',
    '{"email": true, "push": true, "sms": false, "marketing": false}'
  );
  
  -- Создаем запись в программе лояльности
  INSERT INTO public.loyalty_program (user_id, points, tier, total_spent, total_orders)
  VALUES (NEW.user_id, 0, 'bronze', 0, 0);
  
  RETURN NEW;
END;
$$;

-- Пересоздаем триггеры
DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE TRIGGER on_order_completed
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_points();

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();

-- Включаем реальное время для уведомлений
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Включаем реальное время для рекомендаций
ALTER TABLE public.recommendations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recommendations;