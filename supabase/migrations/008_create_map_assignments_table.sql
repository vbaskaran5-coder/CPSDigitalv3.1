-- Migration: Create map_assignments table
-- Stores daily assignments of maps (or individual routes) to Route Managers.

-- Drop table if it exists for a clean setup
DROP TABLE IF EXISTS public.map_assignments;

-- Create the map_assignments table
CREATE TABLE public.map_assignments (
    assignment_key TEXT NOT NULL, -- The map name OR route code being assigned (e.g., 'Aldershot #1', 'ALD01')
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE, -- The date this assignment applies to
    route_manager JSONB, -- Storing { name: string, initials: string } as JSONB
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Primary Key: An assignment key (map/route) should only be assigned once per day.
    PRIMARY KEY (assignment_key, assignment_date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.map_assignments ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Allow authenticated users (Console, RM) to read assignments.
-- Needs refinement: RMs should likely only see their own assignments or assignments within their console profile's territory.
CREATE POLICY "Allow authenticated read access"
ON public.map_assignments
FOR SELECT
TO authenticated
USING (true); -- START BROAD

-- Allow Console users to create/update/delete assignments (Requires roles later).
CREATE POLICY "Allow Console insert access (Placeholder)"
ON public.map_assignments
FOR INSERT
TO authenticated
WITH CHECK (false); -- Placeholder: Needs role check

CREATE POLICY "Allow Console update access (Placeholder)"
ON public.map_assignments
FOR UPDATE
TO authenticated
USING (false); -- Placeholder: Needs role check

CREATE POLICY "Allow Console delete access (Placeholder)"
ON public.map_assignments
FOR DELETE
TO authenticated
USING (false); -- Placeholder: Needs role check


-- Use the existing trigger function for updated_at timestamp
CREATE TRIGGER set_map_assignments_timestamp
BEFORE UPDATE ON public.map_assignments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes
CREATE INDEX IF NOT EXISTS map_assignments_key_date_idx ON public.map_assignments (assignment_key, assignment_date);
CREATE INDEX IF NOT EXISTS map_assignments_date_idx ON public.map_assignments (assignment_date);

-- Add comments for clarity
COMMENT ON TABLE public.map_assignments IS 'Stores daily assignments of map territories or individual routes to Route Managers.';
COMMENT ON COLUMN public.map_assignments.assignment_key IS 'The name of the map or the specific route code being assigned.';
COMMENT ON COLUMN public.map_assignments.assignment_date IS 'The date for which this assignment is valid.';
COMMENT ON COLUMN public.map_assignments.route_manager IS 'JSONB object storing { name: string, initials: string } of the assigned Route Manager.';