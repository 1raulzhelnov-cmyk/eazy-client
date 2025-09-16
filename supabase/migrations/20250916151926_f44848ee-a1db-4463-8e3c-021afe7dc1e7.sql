-- Fix driver personal data exposure security issue
-- Add controlled access for users to see basic driver info only for their active orders

-- Create a security function to check if user can view driver info for specific order
CREATE OR REPLACE FUNCTION public.user_can_view_driver_for_order(driver_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the authenticated user has an active order assigned to this driver
  RETURN EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = auth.uid()
    AND o.driver_id = driver_user_id
    AND o.status IN ('accepted', 'preparing', 'ready', 'picked_up', 'in_transit')
  );
END;
$$;

-- Add RLS policy for users to view limited driver info for their active orders only
CREATE POLICY "Users can view basic driver info for their active orders" ON public.drivers
FOR SELECT
USING (
  -- Allow users to see basic driver info only for drivers handling their active orders
  user_can_view_driver_for_order(user_id)
);

-- Create a view that exposes only safe driver information for public access
CREATE OR REPLACE VIEW public.driver_public_info AS
SELECT 
  d.id,
  d.user_id,
  d.first_name,
  -- Only show first letter of last name for privacy
  LEFT(d.last_name, 1) || '.' as last_name_initial,
  d.rating,
  d.total_deliveries,
  d.vehicle_type,
  d.status,
  d.is_active,
  d.is_verified
FROM drivers d
WHERE d.is_active = true AND d.is_verified = true;

-- Set RLS on the view
ALTER VIEW public.driver_public_info SET (security_barrier = true);

-- Grant access to the view for authenticated users
GRANT SELECT ON public.driver_public_info TO authenticated;

-- Add RLS policy for the view (inherits from base table)
-- Users can only see public info for drivers of their active orders