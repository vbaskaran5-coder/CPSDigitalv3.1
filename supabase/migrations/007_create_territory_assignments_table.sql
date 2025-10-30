/*
  # Add Master Bookings columns

  1. Changes
    - Add new columns to match the Master Bookings spreadsheet structure
    - Add indexes for improved query performance
    
  2. New Columns
    - booking_id (text)
    - master_map (text)
    - call_first_notes (text)
    - completed (boolean)
    - cancelled (boolean)
    - log_sheet_notes (text)
*/

-- Add new columns
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS booking_id text,
ADD COLUMN IF NOT EXISTS master_map text,
ADD COLUMN IF NOT EXISTS call_first_notes text,
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancelled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS log_sheet_notes text;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS jobs_booking_id_idx ON public.jobs (booking_id);
CREATE INDEX IF NOT EXISTS jobs_master_map_idx ON public.jobs (master_map);
CREATE INDEX IF NOT EXISTS jobs_completed_idx ON public.jobs (completed);
CREATE INDEX IF NOT EXISTS jobs_cancelled_idx ON public.jobs (cancelled);