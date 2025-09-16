-- Fix security definer view issue by removing the problematic view
-- and using a secure function-based approach instead

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.driver_public_info;

-- Create a secure function to get safe driver info for active orders only
CREATE OR REPLACE FUNCTION public.get_driver_info_for_user_order(order_id_param UUID)
RETURNS TABLE (
  driver_id UUID,
  first_name TEXT,
  last_name_initial TEXT,
  rating NUMERIC,
  total_deliveries INTEGER,
  vehicle_type TEXT,
  status TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user owns this order
  IF NOT EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_id_param 
    AND o.user_id = auth.uid()
    AND o.status IN ('accepted', 'preparing', 'ready', 'picked_up', 'in_transit')
  ) THEN
    RAISE EXCEPTION 'Order not found or access denied';
  END IF;

  -- Return safe driver information for this specific order
  RETURN QUERY
  SELECT 
    d.user_id as driver_id,
    d.first_name,
    LEFT(d.last_name, 1) || '.' as last_name_initial,
    d.rating,
    d.total_deliveries,
    d.vehicle_type,
    d.status
  FROM drivers d
  JOIN orders o ON d.user_id = o.driver_id
  WHERE o.id = order_id_param
  AND d.is_active = true 
  AND d.is_verified = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_driver_info_for_user_order(UUID) TO authenticated;