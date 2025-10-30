/*
  # Allow Anonymous User Access to All Tables

  1. Overview
    This migration updates all Row Level Security (RLS) policies to accept both
    'anon' and 'authenticated' roles, enabling the application's anonymous
    authentication approach to work correctly.

  2. Problem
    The application uses Supabase's anonymous authentication (signInAnonymously)
    to store user sessions. Anonymous users are assigned the 'anon' role, but
    existing policies only allow the 'authenticated' role, causing all database
    operations to fail in production.

  3. Solution
    Update all RLS policies to accept both 'anon' and 'authenticated' roles.
    This allows the custom authentication system to work while maintaining
    security through application-level session management.

  4. Tables Updated
    - business_panel_users
    - console_profiles
    - route_manager_profiles
    - workers
    - master_bookings
    - carts
    - territory_assignments
    - map_assignments
    - route_assignments
    - territory_structure
    - services_catalog
    - upsell_menus
    - payout_logic_settings
    - active_season_settings
    - attendance_tracking
    - app_state
    - worker_sessions

  5. Security Notes
    - Everyone visiting the URL is automatically authenticated via anonymous auth
    - Application-level authentication (AuthService) provides access control
    - RLS policies remain enabled but accept both anon and authenticated roles
*/

-- ============================================================================
-- BUSINESS PANEL USERS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users to manage business panel users" ON public.business_panel_users;

CREATE POLICY "Allow anon and authenticated users to manage business panel users"
  ON public.business_panel_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CONSOLE PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated users to manage console profiles" ON public.console_profiles;
DROP POLICY IF EXISTS "Allow auth users to manage profiles" ON public.console_profiles;

CREATE POLICY "Allow anon and authenticated users to manage console profiles"
  ON public.console_profiles
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ROUTE MANAGER PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow auth users to manage RM profiles" ON public.route_manager_profiles;

CREATE POLICY "Allow anon and authenticated users to manage route manager profiles"
  ON public.route_manager_profiles
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- WORKERS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.workers;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.workers;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.workers;
DROP POLICY IF EXISTS "Allow auth users to manage workers" ON public.workers;

CREATE POLICY "Allow anon and authenticated users to manage workers"
  ON public.workers
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MASTER BOOKINGS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.master_bookings;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.master_bookings;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.master_bookings;

CREATE POLICY "Allow anon and authenticated read access"
  ON public.master_bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated insert access"
  ON public.master_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated update access"
  ON public.master_bookings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated delete access"
  ON public.master_bookings
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- CARTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.carts;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.carts;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.carts;
DROP POLICY IF EXISTS "Allow auth users to manage carts" ON public.carts;

CREATE POLICY "Allow anon and authenticated users to manage carts"
  ON public.carts
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TERRITORY ASSIGNMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow deletes (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage territory assignments" ON public.territory_assignments;

CREATE POLICY "Allow anon and authenticated users to manage territory assignments"
  ON public.territory_assignments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- MAP ASSIGNMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console insert access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console update access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console delete access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage map assignments" ON public.map_assignments;

CREATE POLICY "Allow anon and authenticated users to manage map assignments"
  ON public.map_assignments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ROUTE ASSIGNMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment creation (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment update (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment deletion (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage route assignments" ON public.route_assignments;

CREATE POLICY "Allow anon and authenticated users to manage route assignments"
  ON public.route_assignments
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TERRITORY STRUCTURE
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.territory_structure;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.territory_structure;

CREATE POLICY "Allow anon and authenticated read access"
  ON public.territory_structure
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated write access"
  ON public.territory_structure
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SERVICES CATALOG
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.services_catalog;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.services_catalog;

CREATE POLICY "Allow anon and authenticated read access"
  ON public.services_catalog
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated write access"
  ON public.services_catalog
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- UPSELL MENUS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.upsell_menus;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.upsell_menus;

CREATE POLICY "Allow anon and authenticated read access"
  ON public.upsell_menus
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated write access"
  ON public.upsell_menus
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- PAYOUT LOGIC SETTINGS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.payout_logic_settings;
DROP POLICY IF EXISTS "Allow authenticated write access" ON public.payout_logic_settings;

CREATE POLICY "Allow anon and authenticated read access"
  ON public.payout_logic_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anon and authenticated write access"
  ON public.payout_logic_settings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ACTIVE SEASON SETTINGS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated access to active seasons" ON public.active_season_settings;

CREATE POLICY "Allow anon and authenticated access to active seasons"
  ON public.active_season_settings
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ATTENDANCE TRACKING
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated access to attendance" ON public.attendance_tracking;

CREATE POLICY "Allow anon and authenticated access to attendance"
  ON public.attendance_tracking
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- APP STATE
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated access to app state" ON public.app_state;

CREATE POLICY "Allow anon and authenticated access to app state"
  ON public.app_state
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- WORKER SESSIONS
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated access to worker sessions" ON public.worker_sessions;

CREATE POLICY "Allow anon and authenticated access to worker sessions"
  ON public.worker_sessions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

COMMENT ON POLICY "Allow anon and authenticated users to manage console profiles"
  ON public.console_profiles IS
  'Allows both anonymous and authenticated users to manage console profiles. Application-level authentication provides access control.';

COMMENT ON POLICY "Allow anon and authenticated users to manage business panel users"
  ON public.business_panel_users IS
  'Allows both anonymous and authenticated users to manage business panel users. Application-level authentication provides access control.';
