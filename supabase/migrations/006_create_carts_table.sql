-- Migration: Create carts table
-- Stores information about teams (carts) used during Team Seasons.

-- Drop table if it exists for a clean setup
DROP TABLE IF EXISTS public.carts;

-- Create the carts table
CREATE TABLE public.carts (
    id SERIAL PRIMARY KEY, -- Auto-incrementing integer ID for the cart itself
    -- Store route manager info as JSONB object { name: string, initials: string }
    -- This matches the structure used in the workers table.
    route_manager JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    -- Note: Workers are linked TO this table via the 'cart_id' column in the 'workers' table.
    -- We don't necessarily need an array of worker IDs here unless specifically required later.
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Allow authenticated users (Console, RM) to read cart information.
CREATE POLICY "Allow authenticated read access"
ON public.carts
FOR SELECT
TO authenticated
USING (true);

-- Restrict updates and inserts for now. Likely managed by Console users.
CREATE POLICY "Allow updates (Placeholder)"
ON public.carts
FOR UPDATE
TO authenticated
USING (false); -- Placeholder

CREATE POLICY "Allow inserts (Placeholder)"
ON public.carts
FOR INSERT
TO authenticated
WITH CHECK (false); -- Placeholder

-- Use the existing trigger function for updated_at timestamp
CREATE TRIGGER set_carts_timestamp
BEFORE UPDATE ON public.carts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments for clarity
COMMENT ON TABLE public.carts IS 'Represents a team cart for Team Seasons, potentially assigned to a Route Manager.';
COMMENT ON COLUMN public.carts.route_manager IS 'JSONB object containing { name: string, initials: string } of the assigned Route Manager (optional).';