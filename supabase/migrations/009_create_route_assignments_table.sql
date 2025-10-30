-- Migration: Create route_assignments table
-- Stores daily assignments of specific routes to individual workers (contractors).

-- Drop table if it exists for a clean setup
DROP TABLE IF EXISTS public.route_assignments;

-- Create the route_assignments table
CREATE TABLE public.route_assignments (
    route_code TEXT NOT NULL,         -- The specific route code being assigned (e.g., 'ALD01')
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE, -- The date this assignment applies to
    worker_id TEXT NOT NULL,          -- The contractor_id of the worker assigned

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Primary Key: A route should only be assigned to one worker per day.
    PRIMARY KEY (route_code, assignment_date),

    -- Foreign Key constraint: Ensure worker_id refers to a valid worker
    -- Use ON DELETE CASCADE: If a worker is deleted, remove their route assignments.
    CONSTRAINT fk_worker
        FOREIGN KEY(worker_id)
        REFERENCES public.workers(contractor_id)
        ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Allow authenticated users (Console, RM, Workers) to read assignments.
-- Needs refinement: RMs/Workers should likely only see assignments relevant to them/their team.
CREATE POLICY "Allow authenticated read access"
ON public.route_assignments
FOR SELECT
TO authenticated
USING (true); -- START BROAD

-- Allow RMs/Console users to create/update/delete assignments (Requires roles later).
CREATE POLICY "Allow assignment creation (Placeholder)"
ON public.route_assignments
FOR INSERT
TO authenticated
WITH CHECK (false); -- Placeholder: Needs role check

CREATE POLICY "Allow assignment update (Placeholder)"
ON public.route_assignments
FOR UPDATE
TO authenticated
USING (false); -- Placeholder: Needs role check

CREATE POLICY "Allow assignment deletion (Placeholder)"
ON public.route_assignments
FOR DELETE
TO authenticated
USING (false); -- Placeholder: Needs role check


-- Use the existing trigger function for updated_at timestamp
-- (Assuming trigger_set_timestamp function was created in a previous migration)
CREATE TRIGGER set_route_assignments_timestamp
BEFORE UPDATE ON public.route_assignments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes
CREATE INDEX IF NOT EXISTS route_assignments_key_date_idx ON public.route_assignments (route_code, assignment_date);
CREATE INDEX IF NOT EXISTS route_assignments_date_worker_idx ON public.route_assignments (assignment_date, worker_id);
CREATE INDEX IF NOT EXISTS route_assignments_worker_id_idx ON public.route_assignments (worker_id);


-- Add comments for clarity
COMMENT ON TABLE public.route_assignments IS 'Stores daily assignments of specific routes to individual workers.';
COMMENT ON COLUMN public.route_assignments.route_code IS 'The specific route code being assigned (e.g., ALD01).';
COMMENT ON COLUMN public.route_assignments.assignment_date IS 'The date for which this assignment is valid.';
COMMENT ON COLUMN public.route_assignments.worker_id IS 'The contractor_id of the worker assigned to the route for the day.';