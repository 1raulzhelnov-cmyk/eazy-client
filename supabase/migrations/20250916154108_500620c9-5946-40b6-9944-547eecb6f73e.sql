-- Create secure function for driver information that only returns safe data
CREATE OR REPLACE FUNCTION public.get_safe_driver_info_for_order(order_id_param uuid)
RETURNS TABLE(
  driver_id uuid, 
  first_name text, 
  last_name_initial text, 
  rating numeric, 
  vehicle_type text, 
  status text
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

  -- Return only safe driver information
  RETURN QUERY
  SELECT 
    d.user_id as driver_id,
    d.first_name,
    LEFT(d.last_name, 1) || '.' as last_name_initial,
    d.rating,
    d.vehicle_type,
    d.status
  FROM drivers d
  JOIN orders o ON d.user_id = o.driver_id
  WHERE o.id = order_id_param
  AND d.is_active = true 
  AND d.is_verified = true;
END;
$$;

-- Update RLS policies for drivers table to be more restrictive
DROP POLICY IF EXISTS "Users can view basic driver info for their active orders" ON drivers;

CREATE POLICY "Users can view minimal driver info for active orders only" 
ON drivers 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  (
    is_active = true AND 
    is_verified = true AND
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.driver_id = drivers.user_id 
      AND o.user_id = auth.uid() 
      AND o.status IN ('accepted', 'preparing', 'ready', 'picked_up', 'in_transit')
    )
  )
);

-- Create more restrictive policy for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can only view their own profile" 
ON profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add validation for recommendations
CREATE OR REPLACE FUNCTION public.validate_recommendation_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate recommendation type
  IF NEW.recommendation_type NOT IN ('restaurant', 'dish', 'category', 'promotion') THEN
    RAISE EXCEPTION 'Invalid recommendation type';
  END IF;
  
  -- Validate relevance score
  IF NEW.relevance_score < 0.0 OR NEW.relevance_score > 1.0 THEN
    RAISE EXCEPTION 'Relevance score must be between 0.0 and 1.0';
  END IF;
  
  -- Sanitize item_id
  NEW.item_id = regexp_replace(NEW.item_id, '[^a-zA-Z0-9_-]', '', 'g');
  
  RETURN NEW;
END;
$$;

-- Create trigger for recommendation validation
DROP TRIGGER IF EXISTS validate_recommendations ON recommendations;
CREATE TRIGGER validate_recommendations
  BEFORE INSERT OR UPDATE ON recommendations
  FOR EACH ROW
  EXECUTE FUNCTION validate_recommendation_data();