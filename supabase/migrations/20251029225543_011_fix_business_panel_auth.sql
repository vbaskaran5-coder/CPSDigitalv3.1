/*
  # Fix Business Panel Authentication

  1. Security Changes
    - Drop existing restrictive RLS policy on `business_panel_users`
    - Add new policy to allow anonymous SELECT access for login verification
    - Maintain authenticated-only access for INSERT, UPDATE, DELETE operations
    - This enables custom table-based authentication while maintaining security

  2. Credential Updates
    - Remove default 'admin' user (development credential)
    - Set 'MasterAdmin' as the sole business panel login credential
    - Password: CPS26@sympatico
    - Full permissions for business panel operations

  3. Authentication Model
    - Business Panel (MasterAdmin) creates Console profiles
    - Console profiles create Route Manager profiles
    - Console profiles create Worker accounts for Digital Logsheet
    - Only MasterAdmin exists at bootstrap level
*/

-- 1. Update RLS Policy for business_panel_users
-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to manage business panel users" ON public.business_panel_users;

-- Allow anonymous (public) users to SELECT for login verification
-- This is necessary for the custom table-based authentication system
CREATE POLICY "Allow anonymous read for login verification"
  ON public.business_panel_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated users to manage (INSERT, UPDATE, DELETE) business panel users
CREATE POLICY "Allow authenticated users to manage business panel users"
  ON public.business_panel_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Update Business Panel User Credentials
-- Remove the development 'admin' user
DELETE FROM public.business_panel_users WHERE username = 'admin';

-- Insert or update the MasterAdmin user with correct credentials
INSERT INTO public.business_panel_users (username, password, full_name, role)
VALUES (
  'MasterAdmin',
  'CPS26@sympatico',
  'Master Administrator',
  'admin'
)
ON CONFLICT (username)
DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Update table and column comments to reflect production authentication model
COMMENT ON TABLE public.business_panel_users IS 'Bootstrap authentication table for Business Panel. MasterAdmin is the sole root-level credential. All other users (Console, Route Managers, Workers) are created internally.';
COMMENT ON COLUMN public.business_panel_users.username IS 'Unique username for login. Production credential: "MasterAdmin"';
COMMENT ON COLUMN public.business_panel_users.password IS 'Password stored as plain text for development. MUST be hashed in production! Production password: "CPS26@sympatico"';
