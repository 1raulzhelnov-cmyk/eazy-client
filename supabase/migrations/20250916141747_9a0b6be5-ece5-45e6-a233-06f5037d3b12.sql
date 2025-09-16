-- Создаем таблицу для курьеров
CREATE TABLE public.drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'car',
  license_plate TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  current_location JSONB,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 5.0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для таблицы курьеров
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Политики доступа для курьеров
CREATE POLICY "Drivers can view their own profile"
ON public.drivers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile"
ON public.drivers
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert their own profile"
ON public.drivers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Создаем таблицу заявок на работу курьером
CREATE TABLE public.driver_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  license_plate TEXT,
  driver_license_photo TEXT,
  vehicle_registration_photo TEXT,
  passport_photo TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для заявок
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

-- Политики для заявок курьеров
CREATE POLICY "Users can view their own applications"
ON public.driver_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.driver_applications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications"
ON public.driver_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Добавляем поля для курьеров в таблицу заказов
ALTER TABLE public.orders 
ADD COLUMN driver_id UUID REFERENCES public.drivers(id),
ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN delivery_started_at TIMESTAMP WITH TIME ZONE;

-- Создаем триггеры для обновления updated_at
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_applications_updated_at
  BEFORE UPDATE ON public.driver_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();