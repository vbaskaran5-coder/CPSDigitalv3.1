-- Migration: Seed initial data (v4 - Fixes INSERT logic for unique constraints)
-- Adds essential default data and updates RLS policies safely.

-- NOTE: This script assumes the tables console_profiles exist.

-- 1. Insert Default Business Panel User
--    *** No SQL needed for this step based on current code ***


-- 2. Insert Default Console Profile (Example: East - Main Office)
-- Explicitly delete potential existing rows based on UNIQUE constraints before inserting.
DELETE FROM public.console_profiles WHERE title = 'Main Office';
DELETE FROM public.console_profiles WHERE username = 'main';

-- Insert the default profile
INSERT INTO public.console_profiles (title, username, password, region, seasons)
VALUES (
    'Main Office', -- title
    'main',        -- username
    'main',        -- password (STORE HASHED in production!)
    'East',        -- region
    -- Construct the JSONB array for East seasons based on hardcodedData.ts
    jsonb_build_array(
        -- East Aeration
        jsonb_build_object(
            'hardcodedId', 'east-aeration',
            'enabled', true,
            'enabledUpsellIds', jsonb_build_array('driveway-sealing', 'hot-asphalt-ramp'),
            'payoutLogic', '{ "taxRate": 13, "productCost": 0, "baseCommissionRate": 8.0, "applySilverRaises": true, "applyAlumniRaises": true, "paymentMethodPercentages": { "Cash": { "percentage": 100, "applyTaxes": true }, "Cheque": { "percentage": 100, "applyTaxes": true }, "E-Transfer": { "percentage": 100, "applyTaxes": true }, "Credit Card": { "percentage": 100, "applyTaxes": true }, "Prepaid": { "percentage": 50, "applyTaxes": true }, "Billed": { "percentage": 50, "applyTaxes": true }, "IOS": { "percentage": 50, "applyTaxes": true }, "Custom": { "percentage": 100, "applyTaxes": true } } }'::jsonb
        ),
        -- East Sealing
        jsonb_build_object(
            'hardcodedId', 'east-sealing',
            'enabled', true,
            'enabledUpsellIds', jsonb_build_array('driveway-sealing', 'hot-asphalt-ramp'),
            'payoutLogic', '{ "taxRate": 13, "productCost": 20, "soloBaseCommissionRate": 6.0, "teamBaseCommissionRate": 8.0, "applySilverRaises": true, "applyAlumniRaises": true, "paymentMethodPercentages": { "Cash": { "percentage": 100, "applyTaxes": true }, "Cheque": { "percentage": 100, "applyTaxes": true }, "E-Transfer": { "percentage": 100, "applyTaxes": true }, "Credit Card": { "percentage": 100, "applyTaxes": true }, "Prepaid": { "percentage": 50, "applyTaxes": true }, "Billed": { "percentage": 50, "applyTaxes": true }, "IOS": { "percentage": 50, "applyTaxes": true }, "Custom": { "percentage": 100, "applyTaxes": true } } }'::jsonb
        )
    )
);
-- Removed the problematic ON CONFLICT clauses, relying on the DELETEs above.


-- 3. Update RLS Policies (Using DROP POLICY IF EXISTS)

-- Console Profiles: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.console_profiles;
DROP POLICY IF EXISTS "Allow individual users to update their own profile (Placeholder)" ON public.console_profiles;
DROP POLICY IF EXISTS "Allow profile creation (Placeholder)" ON public.console_profiles;
DROP POLICY IF EXISTS "Allow auth users to manage profiles" ON public.console_profiles;

CREATE POLICY "Allow auth users to manage profiles"
ON public.console_profiles
FOR ALL -- Covers INSERT, UPDATE, DELETE
TO authenticated
USING (true)
WITH CHECK (true);

-- Route Manager Profiles: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.route_manager_profiles;
DROP POLICY IF EXISTS "Allow auth users to manage RM profiles" ON public.route_manager_profiles;

CREATE POLICY "Allow auth users to manage RM profiles"
ON public.route_manager_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Workers: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.workers;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.workers;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.workers;
DROP POLICY IF EXISTS "Allow auth users to manage workers" ON public.workers;

CREATE POLICY "Allow auth users to manage workers"
ON public.workers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Carts: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.carts;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.carts;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.carts;
DROP POLICY IF EXISTS "Allow auth users to manage carts" ON public.carts;

CREATE POLICY "Allow auth users to manage carts"
ON public.carts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Territory Assignments: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow updates (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow inserts (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow deletes (Placeholder)" ON public.territory_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage territory assignments" ON public.territory_assignments;

CREATE POLICY "Allow auth users to manage territory assignments"
ON public.territory_assignments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Map Assignments: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console insert access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console update access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow Console delete access (Placeholder)" ON public.map_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage map assignments" ON public.map_assignments;

CREATE POLICY "Allow auth users to manage map assignments"
ON public.map_assignments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Route Assignments: Allow authenticated users to manage
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment creation (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment update (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow assignment deletion (Placeholder)" ON public.route_assignments;
DROP POLICY IF EXISTS "Allow auth users to manage route assignments" ON public.route_assignments;

CREATE POLICY "Allow auth users to manage route assignments"
ON public.route_assignments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Master Bookings: Allow authenticated users to manage (Keep policies broad for now)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.master_bookings;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.master_bookings;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.master_bookings;

CREATE POLICY "Allow authenticated read access"
ON public.master_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert access"
ON public.master_bookings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access"
ON public.master_bookings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


-- Final check comment
COMMENT ON COLUMN public.console_profiles.password IS 'Password stored as plain text for seeding. Update with hashing mechanism.';