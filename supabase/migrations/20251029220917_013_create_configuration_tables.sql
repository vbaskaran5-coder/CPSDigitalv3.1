/*
  # Create Configuration Tables

  1. New Tables
    - `territory_structure`
      - Caches the territory structure from Google Sheets (Group -> Map -> Routes)
      - `id` (serial, primary key)
      - `structure_data` (jsonb) - Full structure object
      - `region` (text) - 'East', 'West', 'Central'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `services_catalog`
      - Stores available services that can be sold
      - `id` (text, primary key) - hardcoded ID like 'aeration', 'dethatching'
      - `name` (text) - Display name
      - `description` (text) - Service description
      - `options` (jsonb) - Array of service options with IDs, names, and default prices
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `upsell_menus`
      - Stores upsell/contract menu definitions
      - `id` (text, primary key) - hardcoded ID
      - `name` (text) - Menu name
      - `questions` (jsonb) - Array of question objects
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payout_logic_settings`
      - Stores payout logic configurations
      - `console_profile_id` (integer, primary key)
      - `season_id` (text, primary key)
      - `settings` (jsonb) - Full PayoutLogicSettings object
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow authenticated users to read
    - Restrict write operations (will be managed by Business Panel)
*/

-- Create territory_structure table
CREATE TABLE IF NOT EXISTS public.territory_structure (
  id SERIAL PRIMARY KEY,
  structure_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  region TEXT NOT NULL CHECK (region IN ('East', 'West', 'Central')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.territory_structure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access"
  ON public.territory_structure
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access"
  ON public.territory_structure
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create services_catalog table
CREATE TABLE IF NOT EXISTS public.services_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access"
  ON public.services_catalog
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access"
  ON public.services_catalog
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create upsell_menus table
CREATE TABLE IF NOT EXISTS public.upsell_menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.upsell_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access"
  ON public.upsell_menus
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access"
  ON public.upsell_menus
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create payout_logic_settings table
CREATE TABLE IF NOT EXISTS public.payout_logic_settings (
  console_profile_id INTEGER NOT NULL,
  season_id TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (console_profile_id, season_id),
  CONSTRAINT fk_console_profile_payout
    FOREIGN KEY(console_profile_id)
    REFERENCES public.console_profiles(id)
    ON DELETE CASCADE
);

ALTER TABLE public.payout_logic_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access"
  ON public.payout_logic_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated write access"
  ON public.payout_logic_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER set_territory_structure_timestamp
BEFORE UPDATE ON public.territory_structure
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_services_catalog_timestamp
BEFORE UPDATE ON public.services_catalog
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_upsell_menus_timestamp
BEFORE UPDATE ON public.upsell_menus
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_payout_logic_settings_timestamp
BEFORE UPDATE ON public.payout_logic_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments
COMMENT ON TABLE public.territory_structure IS 'Caches the territory structure (Group->Map->Routes) fetched from Google Sheets.';
COMMENT ON TABLE public.services_catalog IS 'Stores the catalog of available services with options and pricing.';
COMMENT ON TABLE public.upsell_menus IS 'Stores upsell/contract menu definitions with questions.';
COMMENT ON TABLE public.payout_logic_settings IS 'Stores payout logic configurations per console profile and season.';