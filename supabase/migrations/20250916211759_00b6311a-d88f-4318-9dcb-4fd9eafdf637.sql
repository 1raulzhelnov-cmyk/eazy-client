-- Fix menu categories policy to only show active restaurants
DROP POLICY IF EXISTS "Users can view active categories" ON public.menu_categories;

CREATE POLICY "Users can view categories from active approved restaurants" 
ON public.menu_categories 
FOR SELECT 
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = menu_categories.restaurant_id 
    AND r.is_active = true 
    AND r.registration_status = 'approved'
  )
);