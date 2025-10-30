/*
  # Create Daily Archives Table and Fix Assignment Policies

  1. New Tables
    - `daily_archives`
      - Stores historical assignment data by date
      - `id` (uuid, primary key)
      - `archive_date` (date) - The date this archive represents
      - `archive_type` (text) - Type: 'route_assignments', 'map_assignments', 'attendance'
      - `data` (jsonb) - The archived data
      - `created_at` (timestamptz)
      - UNIQUE constraint on (archive_date, archive_type)

  2. Policy Updates
    - Update route_assignments to allow full CRUD for authenticated AND anonymous users
    - Update map_assignments to allow full CRUD for authenticated AND anonymous users
    - These tables need to be accessible by workers (anonymous sessions)

  3. Notes
    - Archives provide historical tracking of daily assignments
    - Simplified schema without console_profile_id for now (can add later if multi-tenant)
    - Enables daily reset logic to archive previous day's data
*/

-- Create daily_archives table
CREATE TABLE IF NOT EXISTS public.daily_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archive_date DATE NOT NULL,
  archive_type TEXT NOT NULL CHECK (archive_type IN ('route_assignments', 'map_assignments', 'attendance')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_archive_per_date_type
    UNIQUE(archive_date, archive_type)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_daily_archives_date 
  ON public.daily_archives(archive_date);
CREATE INDEX IF NOT EXISTS idx_daily_archives_type 
  ON public.daily_archives(archive_type);
CREATE INDEX IF NOT EXISTS idx_daily_archives_date_type 
  ON public.daily_archives(archive_date, archive_type);

ALTER TABLE public.daily_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated access to archives"
  ON public.daily_archives
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to archives"
  ON public.daily_archives
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Update route_assignments policies to allow full CRUD
DROP POLICY IF EXISTS "Allow assignment creation (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment update (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment deletion (Placeholder)" ON public.route_assignments;

CREATE POLICY "Allow authenticated full access to route assignments"
  ON public.route_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous full access to route assignments"
  ON public.route_assignments
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Update map_assignments policies to allow full CRUD
DROP POLICY IF EXISTS "Allow Console insert access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console update access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console delete access (Placeholder)" ON public.map_assignments;

CREATE POLICY "Allow authenticated full access to map assignments"
  ON public.map_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous full access to map assignments"
  ON public.map_assignments
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.daily_archives IS 'Stores historical snapshots of daily operational data (assignments, attendance)';
COMMENT ON COLUMN public.daily_archives.archive_date IS 'The date this archive represents (usually previous day)';
COMMENT ON COLUMN public.daily_archives.archive_type IS 'Type of data archived: route_assignments, map_assignments, or attendance';
COMMENT ON COLUMN public.daily_archives.data IS 'JSONB snapshot of the data for that day';
