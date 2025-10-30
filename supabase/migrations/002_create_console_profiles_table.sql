/*
  # Create Console Profiles Table

  1. New Tables
    - `console_profiles`
      - `id` (serial, primary key) - Auto-incrementing ID
      - `title` (text, not null) - Profile title/name (e.g., "Main Office", "East Branch")
      - `username` (text, unique, not null) - Username for Console login
      - `password` (text, not null) - Password for Console login
      - `region` (text, not null) - Geographic region: 'East', 'West', or 'Central'
      - `seasons` (jsonb, default '[]') - Array of season configurations with enabled upsells and payout logic
      - `created_at` (timestamptz, default NOW()) - Timestamp of creation
      - `updated_at` (timestamptz, default NOW()) - Timestamp of last update

  2. Security
    - Enable RLS on `console_profiles` table
    - Add policy for authenticated users to manage profiles
    - Console profiles are created and managed by Business Panel users

  3. Notes
    - No initial data seeded - Console profiles are created via Business Panel
    - Each profile can have multiple seasons (e.g., 'east-aeration', 'east-sealing')
    - Seasons include payout logic settings and enabled upsell menus
    - Region determines which territory structure data is accessible
*/

-- Create console_profiles table
CREATE TABLE IF NOT EXISTS public.console_profiles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('East', 'West', 'Central')),
  seasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.console_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to manage console profiles
CREATE POLICY "Allow authenticated users to manage console profiles"
  ON public.console_profiles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_console_profiles_timestamp
BEFORE UPDATE ON public.console_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create index on username for faster login queries
CREATE INDEX IF NOT EXISTS idx_console_profiles_username ON public.console_profiles(username);

-- Add helpful comments
COMMENT ON TABLE public.console_profiles IS 'Console user profiles with season configurations. Created and managed by Business Panel users.';
COMMENT ON COLUMN public.console_profiles.title IS 'Display name for the console profile (e.g., "Main Office", "East Branch").';
COMMENT ON COLUMN public.console_profiles.username IS 'Unique username for Console login. Created by Business Panel administrators.';
COMMENT ON COLUMN public.console_profiles.password IS 'Password stored as plain text for development. MUST be hashed in production!';
COMMENT ON COLUMN public.console_profiles.region IS 'Geographic region: East, West, or Central. Determines accessible territory data.';
COMMENT ON COLUMN public.console_profiles.seasons IS 'Array of season objects with hardcodedId, enabled status, enabledUpsellIds, and payoutLogic settings.';
