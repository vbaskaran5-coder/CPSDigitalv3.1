-- Migration: Create route_manager_profiles table
-- Defines profiles for Route Managers and links them to Console Profiles.

-- Drop table if it exists for a clean setup
DROP TABLE IF EXISTS public.route_manager_profiles;

-- Create the route_manager_profiles table
CREATE TABLE public.route_manager_profiles (
    id SERIAL PRIMARY KEY, -- Auto-incrementing integer ID
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE, -- Unique username for login
    password TEXT NOT NULL, -- Store hashed passwords in a real app
    console_profile_id INTEGER, -- Link to the console_profiles table
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Key constraint: Ensure console_profile_id refers to a valid console_profile
    -- Use ON DELETE SET NULL so deleting a console profile doesn't delete the RM, just unlinks them.
    CONSTRAINT fk_console_profile
        FOREIGN KEY(console_profile_id)
        REFERENCES public.console_profiles(id)
        ON DELETE SET NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.route_manager_profiles ENABLE ROW LEVEL SECURITY;

-- Policies:
-- Allow authenticated users (e.g., Business Panel users) to read all profiles
CREATE POLICY "Allow authenticated read access"
ON public.route_manager_profiles
FOR SELECT
TO authenticated
USING (true);

-- Restrict updates and inserts for now, assuming management happens via Business Panel
CREATE POLICY "Allow updates (Placeholder)"
ON public.route_manager_profiles
FOR UPDATE
TO authenticated
USING (false); -- Placeholder

CREATE POLICY "Allow inserts (Placeholder)"
ON public.route_manager_profiles
FOR INSERT
TO authenticated
WITH CHECK (false); -- Placeholder

-- Use the existing trigger function for updated_at timestamp
-- (Assuming trigger_set_timestamp function was created in the previous migration)
CREATE TRIGGER set_route_manager_profiles_timestamp
BEFORE UPDATE ON public.route_manager_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add comments for clarity
COMMENT ON TABLE public.route_manager_profiles IS 'Stores login and profile information for Route Managers.';
COMMENT ON COLUMN public.route_manager_profiles.console_profile_id IS 'Foreign key linking to the console_profiles table.';
COMMENT ON COLUMN public.route_manager_profiles.password IS 'Stores user password. Should be hashed in production.';