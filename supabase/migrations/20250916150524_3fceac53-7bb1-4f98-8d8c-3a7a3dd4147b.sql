-- Создаем демонстрационного пользователя-водителя для тестирования интерфейса
-- Сначала создаем тестового пользователя
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'demo.driver@eazy.ee',
  crypt('demopassword123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Алексей","last_name":"Демо"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Создаем профиль для демо-водителя
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name
) 
SELECT 
  id,
  'Алексей',
  'Демо'
FROM auth.users 
WHERE email = 'demo.driver@eazy.ee';

-- Создаем заявку водителя
INSERT INTO public.driver_applications (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  vehicle_type,
  license_plate,
  status,
  admin_notes
)
SELECT 
  id,
  'Алексей',
  'Демо',
  '+372 5555555',
  'demo.driver@eazy.ee',
  'car',
  'ABC123',
  'approved',
  'Демонстрационная заявка одобрена'
FROM auth.users 
WHERE email = 'demo.driver@eazy.ee';

-- Создаем запись водителя
INSERT INTO public.drivers (
  user_id,
  first_name,
  last_name,
  phone,
  email,
  vehicle_type,
  license_plate,
  status,
  rating,
  total_deliveries,
  is_verified,
  is_active
)
SELECT 
  id,
  'Алексей',
  'Демо',
  '+372 5555555',
  'demo.driver@eazy.ee',
  'car',
  'ABC123',
  'offline',
  4.8,
  45,
  true,
  true
FROM auth.users 
WHERE email = 'demo.driver@eazy.ee';

-- Создаем тестовый заказ для демонстрации
INSERT INTO public.orders (
  order_number,
  user_id,
  driver_id,
  status,
  total_amount,
  items,
  customer_info,
  delivery_address,
  payment_method,
  payment_status,
  estimated_delivery_time,
  created_at
)
SELECT 
  'ORD-DEMO-001',
  (SELECT id FROM auth.users WHERE email = 'demo.driver@eazy.ee'),
  (SELECT id FROM auth.users WHERE email = 'demo.driver@eazy.ee'),
  'assigned',
  24.50,
  '[
    {"name": "Пицца Маргарита", "quantity": 1, "price": 12.50, "restaurant": "Pizza Palace"},
    {"name": "Кола 0.5л", "quantity": 2, "price": 6.00, "restaurant": "Pizza Palace"}
  ]'::jsonb,
  '{"name": "Мария Иванова", "phone": "+372 1234567"}'::jsonb,
  '{
    "address_line_1": "Пушкина ул. 15, кв. 23",
    "city": "Нарва",
    "postal_code": "20308",
    "latitude": 59.3776,
    "longitude": 28.1907
  }'::jsonb,
  'card',
  'completed',
  NOW() + INTERVAL '30 minutes',
  NOW();

-- Инициализируем данные лояльности для демо-пользователя
INSERT INTO public.loyalty_program (
  user_id,
  points,
  tier,
  total_spent,
  total_orders
)
SELECT 
  id,
  150,
  'silver',
  245.80,
  12
FROM auth.users 
WHERE email = 'demo.driver@eazy.ee';