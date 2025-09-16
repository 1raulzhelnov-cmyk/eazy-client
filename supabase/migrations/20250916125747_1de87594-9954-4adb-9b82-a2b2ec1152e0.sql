-- Таблица для пользовательских предпочтений и настроек
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  privacy_settings JSONB NOT NULL DEFAULT '{}',
  notification_settings JSONB NOT NULL DEFAULT '{}',
  dietary_restrictions TEXT[],
  favorite_cuisines TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для аналитики поведения пользователей
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для системы лояльности
CREATE TABLE public.loyalty_program (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  total_spent NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для персонализированных рекомендаций
CREATE TABLE public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  relevance_score DECIMAL NOT NULL,
  reasoning TEXT,
  metadata JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для уведомлений
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS на всех таблицах
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies для user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies для user_analytics
CREATE POLICY "Users can insert their own analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies для loyalty_program
CREATE POLICY "Users can view their own loyalty data" 
ON public.loyalty_program 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own loyalty data" 
ON public.loyalty_program 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loyalty data" 
ON public.loyalty_program 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies для recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert recommendations" 
ON public.recommendations 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies для notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Triggers для updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_program_updated_at
BEFORE UPDATE ON public.loyalty_program
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для обновления баллов лояльности при заказе
CREATE OR REPLACE FUNCTION public.update_loyalty_points()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger для автоматического обновления баллов лояльности
CREATE TRIGGER on_order_completed
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_loyalty_points();

-- Функция для создания начальных настроек пользователя
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger для создания начальных данных при создании профиля
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_data();