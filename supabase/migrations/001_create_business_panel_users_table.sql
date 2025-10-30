/*
  # Create Business Panel Users Table

  1. New Tables
    - `business_panel_users`
      - `id` (serial, primary key) - Auto-incrementing ID
      - `username` (text, unique, not null) - Username for login
      - `password` (text, not null) - Password (plain text for dev, should be hashed in production)
      - `permissions` (jsonb, default '{}') - JSON object storing user permissions
      - `created_at` (timestamptz, default NOW()) - Timestamp of creation
      - `updated_at` (timestamptz, default NOW()) - Timestamp of last update

  2. Security
    - Enable RLS on `business_panel_users` table
    - Add policy for authenticated users to read and manage records
    - This is the bootstrap authentication table - Business Panel users create Console and Route Manager accounts

  3. Initial Data
    - Seed default admin user with credentials:
      - Username: admin
      - Password: admin123
    - NOTE: These are development credentials and should be changed in production!
*/

-- Create timestamp update trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create business_panel_users table
CREATE TABLE IF NOT EXISTS public.business_panel_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.business_panel_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage business panel users
CREATE POLICY "Allow authenticated users to manage business panel users"
  ON public.business_panel_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at timestamp
DROP TRIGGER IF EXISTS set_business_panel_users_timestamp ON public.business_panel_users;
CREATE TRIGGER set_business_panel_users_timestamp
BEFORE UPDATE ON public.business_panel_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Seed initial admin user
INSERT INTO public.business_panel_users (username, password, permissions)
VALUES (
  'admin',
  'admin123',
  '{"role": "admin", "canManageConsoleProfiles": true, "canManageRouteManagers": true, "canManageTerritories": true, "canManageSettings": true}'::jsonb
)
ON CONFLICT (username) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE public.business_panel_users IS 'Bootstrap authentication table for Business Panel administrators. Business Panel users can create Console and Route Manager accounts.';
COMMENT ON COLUMN public.business_panel_users.username IS 'Unique username for login. Default admin account: "admin"';
COMMENT ON COLUMN public.business_panel_users.password IS 'Password stored as plain text for development. MUST be hashed in production! Default: "admin123"';
COMMENT ON COLUMN public.business_panel_users.permissions IS 'JSON object storing user permissions and roles.';
