/*
  # Add Season ID Support to Tables

  1. Schema Changes
    - Add `season_id` column to `master_bookings` table
    - Add unique constraint on region for territory_structure
    - Add indexes for season-based queries

  2. Indexes
    - Create index on master_bookings(season_id)
    - Create composite indexes for common query patterns

  3. Notes
    - Season IDs are hardcoded strings like 'east-aeration', 'west-spring-rejuv'
    - This enables filtering bookings by season across all devices
    - Territory structure is unique per region for easier lookups
*/

-- Add season_id to master_bookings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'master_bookings' AND column_name = 'season_id'
  ) THEN
    ALTER TABLE public.master_bookings ADD COLUMN season_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_master_bookings_season ON public.master_bookings(season_id);
    CREATE INDEX IF NOT EXISTS idx_master_bookings_season_contractor ON public.master_bookings(season_id, contractor_number);
    CREATE INDEX IF NOT EXISTS idx_master_bookings_season_route ON public.master_bookings(season_id, route_number);
    CREATE INDEX IF NOT EXISTS idx_master_bookings_season_map ON public.master_bookings(season_id, master_map);
    COMMENT ON COLUMN public.master_bookings.season_id IS 'Hardcoded season identifier (e.g., east-aeration) to filter bookings by season';
  END IF;
END $$;

-- Add unique constraint on region for territory_structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'territory_structure_region_key'
  ) THEN
    ALTER TABLE public.territory_structure ADD CONSTRAINT territory_structure_region_key UNIQUE(region);
  END IF;
END $$;

-- Create composite index for faster worker queries
CREATE INDEX IF NOT EXISTS idx_workers_cart_status ON public.workers(cart_id, booking_status);

-- Add index for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_tracking(attendance_date);

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_worker_sessions_cart ON public.worker_sessions(cart_id);
