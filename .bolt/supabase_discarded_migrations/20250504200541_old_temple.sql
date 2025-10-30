/*
  # Add back_only column to jobs table
  
  1. Changes
    - Add `back_only` column to jobs table with boolean type and default false
    
  2. Notes
    - Uses safe column addition with IF NOT EXISTS check
    - Sets default value to false for consistency with existing data
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'jobs' 
    AND column_name = 'back_only'
  ) THEN 
    ALTER TABLE jobs ADD COLUMN back_only boolean DEFAULT false;
  END IF;
END $$;