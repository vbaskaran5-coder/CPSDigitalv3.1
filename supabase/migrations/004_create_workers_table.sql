-- Migration: Create workers table
-- Stores information about individual contractors/workers.

-- Drop table if it exists for a clean setup
DROP TABLE IF EXISTS public.workers;

-- Create the workers table
CREATE TABLE public.workers (
    contractor_id TEXT PRIMARY KEY, -- Using the text ID as the primary key
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    cell_phone TEXT,
    home_phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    status TEXT, -- e.g., 'Rookie', 'Alumni'

    -- Historical Performance (Storing as TEXT based on TS type)
    days_worked_previous_years TEXT,
    aeration_silvers_previous_years TEXT,
    rejuv_silvers_previous_years TEXT,
    sealing_silvers_previous_years TEXT,
    cleaning_silvers_previous_years TEXT,

    -- Current Season/Daily Stats
    days_worked INTEGER DEFAULT 0, -- Store current season days as integer
    no_shows INTEGER DEFAULT 0,

    -- Daily Status & Booking
    showed BOOLEAN DEFAULT false,
    showed_date DATE, -- Use DATE type for easier querying
    booking_status TEXT, -- e.g., 'today', 'next_day', 'calendar', 'wdr_tnb', 'quit_fired', 'no_show'
    booked_date DATE, -- Use DATE type
    sub_status TEXT, -- e.g., 'WDR', 'TNB', 'Quit', 'Fired'

    -- Assignment
    -- Store route manager info as JSONB object { name: string, initials: string }
    route_manager JSONB,
    cart_id INTEGER, -- Link to carts (if using a separate carts table later)
    shuttle_line TEXT,

    -- Payout Related (Updated after payout calculation)
    payout_completed BOOLEAN DEFAULT false,
    commission NUMERIC, -- Using NUMERIC for currency/calculations
    gross_sales NUMERIC,
    equivalent NUMERIC,
    -- Store deductions/bonuses/history as JSONB arrays
    deductions JSONB DEFAULT '[]'::jsonb,
    bonuses JSONB DEFAULT '[]'::jsonb,
    payout_history JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Allow authenticated users (e.g., Console, RM, maybe workers themselves?) to read worker data.
CREATE POLICY "Allow authenticated read access"
ON public.workers
FOR SELECT
TO authenticated
USING (true); -- Adjust this if reads need to be restricted (e.g., only RMs see their team)

-- Restrict updates/inserts for now. These should likely be handled by specific roles (Admin/RM).
CREATE POLICY "Allow updates (Placeholder)"
ON public.workers
FOR UPDATE
TO authenticated
USING (false); -- Placeholder

CREATE POLICY "Allow inserts (Placeholder)"
ON public.workers
FOR INSERT
TO authenticated
WITH CHECK (false); -- Placeholder


-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS workers_showed_date_idx ON public.workers (showed_date);
CREATE INDEX IF NOT EXISTS workers_booked_date_idx ON public.workers (booked_date);
CREATE INDEX IF NOT EXISTS workers_booking_status_idx ON public.workers (booking_status);
CREATE INDEX IF NOT EXISTS workers_cart_id_idx ON public.workers (cart_id);

-- Use the existing trigger function for updated_at timestamp
CREATE TRIGGER set_workers_timestamp
BEFORE UPDATE ON public.workers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments for clarity
COMMENT ON TABLE public.workers IS 'Stores contractor/worker information, including status, assignments, and payout history.';
COMMENT ON COLUMN public.workers.contractor_id IS 'Unique identifier for the worker (primary key).';
COMMENT ON COLUMN public.workers.showed_date IS 'The date the worker last showed up (YYYY-MM-DD).';
COMMENT ON COLUMN public.workers.booked_date IS 'The date the worker is currently booked for (YYYY-MM-DD).';
COMMENT ON COLUMN public.workers.route_manager IS 'JSONB object containing { name: string, initials: string } of the assigned Route Manager for the day.';
COMMENT ON COLUMN public.workers.deductions IS 'JSONB array storing Deduction objects.';
COMMENT ON COLUMN public.workers.bonuses IS 'JSONB array storing Bonus objects.';
COMMENT ON COLUMN public.workers.payout_history IS 'JSONB array storing PayoutRecord objects, typically sorted by date descending.';