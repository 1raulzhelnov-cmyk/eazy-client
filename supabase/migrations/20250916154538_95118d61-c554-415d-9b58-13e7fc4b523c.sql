-- ЭТАП 4: Усиление мониторинга - создаем таблицы для аудита и мониторинга

-- Таблица для аудита доступа к данным
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Включаем RLS для audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Политики для audit log - только админы могут читать, система может писать
CREATE POLICY "Admins can view audit log" 
ON security_audit_log 
FOR SELECT 
USING (check_admin_permission('view_audit_logs'));

CREATE POLICY "System can insert audit log entries" 
ON security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Таблица для мониторинга подозрительных активностей
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  title text NOT NULL,
  description text,
  user_id uuid,
  ip_address inet,
  metadata jsonb DEFAULT '{}',
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolved_by uuid
);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security alerts" 
ON security_alerts 
FOR ALL 
USING (check_admin_permission('manage_security'));

-- ЭТАП 5: Compliance и согласия пользователей
CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  consent_type text NOT NULL,
  granted boolean NOT NULL DEFAULT false,
  ip_address inet,
  user_agent text,
  version text NOT NULL DEFAULT '1.0',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents" 
ON user_consents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" 
ON user_consents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents" 
ON user_consents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all consents" 
ON user_consents 
FOR SELECT 
USING (check_admin_permission('view_user_data'));

-- Функция для логирования подозрительных активностей
CREATE OR REPLACE FUNCTION public.log_suspicious_activity(
  activity_type text,
  severity_level text DEFAULT 'medium',
  title_text text DEFAULT 'Подозрительная активность',
  description_text text DEFAULT '',
  metadata_json jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO security_alerts (
    alert_type, 
    severity, 
    title, 
    description, 
    user_id, 
    metadata
  ) VALUES (
    activity_type,
    severity_level,
    title_text,
    description_text,
    auth.uid(),
    metadata_json
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Функция для аудита доступа к данным
CREATE OR REPLACE FUNCTION public.audit_data_access(
  action_name text,
  resource_name text,
  resource_identifier text DEFAULT '',
  additional_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    action_name,
    resource_name,
    resource_identifier,
    additional_details
  );
END;
$$;