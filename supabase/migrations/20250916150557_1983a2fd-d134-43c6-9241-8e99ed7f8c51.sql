-- Создаем тестовые данные для демонстрации интерфейса водителя
-- Для простоты будем использовать существующего аутентифицированного пользователя

-- Создаем запись водителя для текущего пользователя (если он есть)
-- Сначала проверим, есть ли уже такая запись
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Получаем ID текущего пользователя из auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Создаем профил, если его нет
        INSERT INTO public.profiles (
            user_id,
            first_name,
            last_name
        ) VALUES (
            current_user_id,
            'Алексей',
            'Демо'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name;

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
        ) VALUES (
            current_user_id,
            'Алексей',
            'Демо',
            '+372 5555555',
            'demo.driver@eazy.ee',
            'car',
            'ABC123',
            'approved',
            'Демонстрационная заявка одобрена'
        )
        ON CONFLICT (user_id) DO UPDATE SET
            status = EXCLUDED.status,
            admin_notes = EXCLUDED.admin_notes;

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
        ) VALUES (
            current_user_id,
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
        )
        ON CONFLICT (user_id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            is_verified = EXCLUDED.is_verified,
            is_active = EXCLUDED.is_active;

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
        ) VALUES (
            'ORD-DEMO-001',
            current_user_id,
            current_user_id,
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
            NOW()
        )
        ON CONFLICT (order_number) DO NOTHING;

        -- Инициализируем данные лояльности
        INSERT INTO public.loyalty_program (
            user_id,
            points,
            tier,
            total_spent,
            total_orders
        ) VALUES (
            current_user_id,
            150,
            'silver',
            245.80,
            12
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END
$$;