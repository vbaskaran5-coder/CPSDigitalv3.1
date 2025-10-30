/*
  # Create Application State Tables

  1. New Tables
    - `active_season_settings`
      - Stores the active season ID for each console profile
      - `console_profile_id` (integer, primary key)
      - `active_season_id` (text) - The hardcoded season ID (e.g., 'east-aeration')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `attendance_tracking`
      - Stores daily attendance finalization status per console profile
      - `console_profile_id` (integer)
      - `attendance_date` (date)
      - `is_finalized` (boolean, default false)
      - `finalized_at` (timestamptz)
      - `created_at` (timestamptz)
      - PRIMARY KEY (console_profile_id, attendance_date)
    
    - `app_state`
      - Stores global application state
      - `key` (text, primary key)
      - `value` (jsonb)
      - `updated_at` (timestamptz)
    
    - `worker_sessions`
      - Stores active worker/contractor login sessions
      - `session_id` (uuid, primary key)
      - `worker_id` (text) - Contractor number
      - `cart_id` (integer, nullable) - If logged in via cart
      - `session_type` (text) - 'contractor' or 'cart_worker'
      - `session_data` (jsonb) - Additional session data
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow authenticated users to read and write
    - Sessions auto-expire after 24 hours

  3. Notes
    - Replaces localStorage for session management
    - Enables cross-device state synchronization
    - Provides centralized state management
*/

-- Create active_season_settings table if not exists
CREATE TABLE IF NOT EXISTS public.active_season_settings (
  console_profile_id INTEGER PRIMARY KEY,
  active_season_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_console_profile_season
    FOREIGN KEY(console_profile_id)
    REFERENCES public.console_profiles(id)
    ON DELETE CASCADE
);

ALTER TABLE public.active_season_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated access to active seasons" ON public.active_season_settings;
CREATE POLICY "Allow authenticated access to active seasons"
  ON public.active_season_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create attendance_tracking table
CREATE TABLE IF NOT EXISTS public.attendance_tracking (
  console_profile_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  is_finalized BOOLEAN DEFAULT false,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (console_profile_id, attendance_date),
  CONSTRAINT fk_console_profile_attendance
    FOREIGN KEY(console_profile_id)
    REFERENCES public.console_profiles(id)
    ON DELETE CASCADE
);

ALTER TABLE public.attendance_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to attendance"
  ON public.attendance_tracking
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create app_state table
CREATE TABLE IF NOT EXISTS public.app_state (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to app state"
  ON public.app_state
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create worker_sessions table
CREATE TABLE IF NOT EXISTS public.worker_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT NOT NULL,
  cart_id INTEGER,
  session_type TEXT NOT NULL CHECK (session_type IN ('contractor', 'cart_worker')),
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  CONSTRAINT fk_cart_session
    FOREIGN KEY(cart_id)
    REFERENCES public.carts(id)
    ON DELETE CASCADE
);

ALTER TABLE public.worker_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to worker sessions"
  ON public.worker_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_active_season_profile ON public.active_season_settings(console_profile_id);
CREATE INDEX IF NOT EXISTS idx_attendance_profile_date ON public.attendance_tracking(console_profile_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_app_state_key ON public.app_state(key);
CREATE INDEX IF NOT EXISTS idx_worker_sessions_worker ON public.worker_sessions(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_sessions_expires ON public.worker_sessions(expires_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_active_season_timestamp
BEFORE UPDATE ON public.active_season_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_app_state_timestamp
BEFORE UPDATE ON public.app_state
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments
COMMENT ON TABLE public.active_season_settings IS 'Stores the currently active season for each console profile';
COMMENT ON TABLE public.attendance_tracking IS 'Tracks daily attendance finalization status per console profile';
COMMENT ON TABLE public.app_state IS 'Stores global application state and configuration';
COMMENT ON TABLE public.worker_sessions IS 'Manages active worker/contractor login sessions';