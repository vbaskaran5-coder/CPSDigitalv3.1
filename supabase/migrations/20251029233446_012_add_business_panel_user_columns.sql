/*
  # Add Missing Columns to Business Panel Users Table

  1. Schema Changes
    - Add `full_name` column (TEXT) to store full name of business panel user
    - Add `role` column (TEXT) to store user role (e.g., 'admin')
    - Keep existing `permissions` JSONB column for backward compatibility
    - Set sensible defaults for new columns

  2. Purpose
    - Fix schema mismatch causing MasterAdmin user INSERT to fail
    - Align table structure with authentication migration expectations
    - Maintain backward compatibility with existing permissions structure

  3. Notes
    - This migration MUST run before migration 011_fix_business_panel_auth
    - Existing records will get default values for new columns
    - No data loss - only adding new columns
*/

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'business_panel_users'
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.business_panel_users
    ADD COLUMN full_name TEXT DEFAULT 'System Administrator';
  END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'business_panel_users'
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.business_panel_users
    ADD COLUMN role TEXT DEFAULT 'admin';
  END IF;
END $$;

-- Update any existing records to have proper values
UPDATE public.business_panel_users
SET full_name = COALESCE(full_name, 'System Administrator'),
    role = COALESCE(role, 'admin')
WHERE full_name IS NULL OR role IS NULL;

-- Add helpful comments
COMMENT ON COLUMN public.business_panel_users.full_name IS 'Full name of the business panel user';
COMMENT ON COLUMN public.business_panel_users.role IS 'User role (e.g., "admin"). Used for authorization and permissions.';
