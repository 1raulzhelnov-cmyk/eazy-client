-- Fix security issue: Create secure public reviews view and update RLS policies

-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all reviews" ON public.reviews;

-- Create a more secure SELECT policy - users can only see their own full reviews
CREATE POLICY "Users can view their own reviews" 
ON public.reviews 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a secure view for public review consumption that hides sensitive data
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  id,
  restaurant_id,
  rating,
  review_text,
  photos,
  created_at,
  updated_at,
  -- Anonymize user_id (show only first 8 characters)
  CASE 
    WHEN user_id IS NOT NULL THEN CONCAT(LEFT(user_id::text, 8), '...')
    ELSE NULL 
  END as anonymous_user_id,
  -- Don't expose order_id at all for privacy
  NULL as order_id
FROM public.reviews;

-- Create RLS policy for the public view - anyone can read public reviews
ALTER VIEW public.public_reviews OWNER TO postgres;

-- Grant access to the view
GRANT SELECT ON public.public_reviews TO public, anon, authenticated;

-- Create a function to get reviews for a specific restaurant (public safe version)
CREATE OR REPLACE FUNCTION public.get_restaurant_reviews(restaurant_id_param text)
RETURNS TABLE (
  id uuid,
  restaurant_id text,
  rating integer,
  review_text text,
  photos text[],
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  anonymous_user_id text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.restaurant_id,
    r.rating,
    r.review_text,
    r.photos,
    r.created_at,
    r.updated_at,
    CASE 
      WHEN r.user_id IS NOT NULL THEN CONCAT(LEFT(r.user_id::text, 8), '...')
      ELSE NULL 
    END as anonymous_user_id
  FROM public.reviews r
  WHERE r.restaurant_id = restaurant_id_param
  ORDER BY r.created_at DESC;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_restaurant_reviews(text) TO public, anon, authenticated;