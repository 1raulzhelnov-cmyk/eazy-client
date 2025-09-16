-- Remove overly permissive user-facing SELECT on drivers to prevent PII exposure
-- Users should fetch limited data via get_safe_driver_info_for_order()

BEGIN;

DROP POLICY IF EXISTS "Users can view minimal driver info for active orders only" ON public.drivers;

-- Keep existing policies for:
--  - Admins (SELECT via permissions)
--  - Drivers viewing/updating their own profile
--  - Inserts/Updates by drivers themselves
-- No replacement SELECT policy for generic users is intentionally added.

COMMIT;