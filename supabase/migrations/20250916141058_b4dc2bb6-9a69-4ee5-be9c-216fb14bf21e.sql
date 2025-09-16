-- Remove the view entirely to eliminate security definer view warning
-- We'll use only the secure function for public review access

DROP VIEW IF EXISTS public.public_reviews;

-- The secure function public.get_restaurant_reviews already exists and is properly configured
-- This approach eliminates the security definer view warning while maintaining security

-- Verify the function exists and has proper permissions
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_restaurant_reviews';