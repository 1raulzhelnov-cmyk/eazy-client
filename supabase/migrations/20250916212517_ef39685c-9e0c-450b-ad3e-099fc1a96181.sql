-- Create tables for promotion system
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  expiry_date TIMESTAMP WITH TIME ZONE,
  applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'restaurant', 'category')),
  target_id TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promo code usage tracking table
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id),
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  discount_amount NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payouts table for financial management
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_id TEXT NOT NULL UNIQUE,
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('restaurant', 'driver')),
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  external_payout_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurant integrations table
CREATE TABLE IF NOT EXISTS public.restaurant_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  integration_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marketing integrations table
CREATE TABLE IF NOT EXISTS public.marketing_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  api_key TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for promo_codes
CREATE POLICY "Public can view active promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (check_admin_permission('manage_promotions'));

-- Create RLS policies for promo_code_usage
CREATE POLICY "Users can view their own promo code usage" 
ON public.promo_code_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert promo code usage" 
ON public.promo_code_usage 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for payouts
CREATE POLICY "Recipients can view their own payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "Admins can manage payouts" 
ON public.payouts 
FOR ALL 
USING (check_admin_permission('manage_finances'));

-- Create RLS policies for restaurant_integrations
CREATE POLICY "Restaurant owners can manage their integrations" 
ON public.restaurant_integrations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.restaurants r 
  WHERE r.id = restaurant_integrations.restaurant_id 
  AND r.user_id = auth.uid()
));

-- Create RLS policies for marketing_integrations
CREATE POLICY "Users can manage their own marketing integrations" 
ON public.marketing_integrations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(is_active, is_public);
CREATE INDEX idx_promo_code_usage_user ON public.promo_code_usage(user_id);
CREATE INDEX idx_promo_code_usage_promo ON public.promo_code_usage(promo_code_id);
CREATE INDEX idx_payouts_recipient ON public.payouts(recipient_id, recipient_type);
CREATE INDEX idx_restaurant_integrations_restaurant ON public.restaurant_integrations(restaurant_id);