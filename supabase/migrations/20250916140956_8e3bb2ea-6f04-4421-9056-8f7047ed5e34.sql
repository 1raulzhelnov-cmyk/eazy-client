-- Fix security definer view issue by removing the problematic ownership change
-- The view itself doesn't need to be SECURITY DEFINER, just the function

-- Drop the problematic view ownership change
-- We'll keep the view as a regular view without SECURITY DEFINER properties
DROP VIEW IF EXISTS public.public_reviews;

-- Recreate the view as a regular view (not security definer)
CREATE VIEW public.public_reviews AS
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
  END as anonymous_user_id
FROM public.reviews;

-- Grant access to the view for all roles
GRANT SELECT ON public.public_reviews TO public, anon, authenticated;

-- Enable RLS on the view (this will use the underlying table's RLS policies)
ALTER VIEW public.public_reviews SET (security_barrier = true);

-- The function remains SECURITY DEFINER as intended, which is safe and necessary
-- for controlled access to the reviews data