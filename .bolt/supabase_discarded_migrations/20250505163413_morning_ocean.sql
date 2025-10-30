/*
  # Update Master Bookings table with new data structure

  1. Changes
    - Drop existing table and recreate with new structure
    - Add new columns to match the spreadsheet
    - Update indexes for commonly queried columns
    
  2. Security
    - Maintain existing RLS policies
    - Keep security settings intact
*/

-- Drop existing table
DROP TABLE IF EXISTS "Master Bookings";

-- Create new table with updated structure
CREATE TABLE "Master Bookings" (
  "Booking ID" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "Booked By" text,
  "Date/Time Booked" text,
  "Master Map" text,
  "Route Number" text,
  "First Name" text,
  "Last Name" text,
  "Full Address" text,
  "Home Phone" text,
  "Cell Phone" text,
  "Email Address" text,
  "Price" text DEFAULT '59.99',
  "Prepaid" text,
  "FO/BO/FP" text,
  "Log Sheet Notes" text,
  "Completed" text,
  "Cancelled" text,
  "Date Completed" text,
  "Status" text,
  "Payment Method" text,
  "Additional Notes" text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS master_bookings_route_number_idx ON "Master Bookings" ("Route Number");
CREATE INDEX IF NOT EXISTS master_bookings_date_time_booked_idx ON "Master Bookings" ("Date/Time Booked");
CREATE INDEX IF NOT EXISTS master_bookings_completed_idx ON "Master Bookings" ("Completed");
CREATE INDEX IF NOT EXISTS master_bookings_cancelled_idx ON "Master Bookings" ("Cancelled");
CREATE INDEX IF NOT EXISTS master_bookings_status_idx ON "Master Bookings" ("Status");

-- Enable RLS
ALTER TABLE "Master Bookings" ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Users can read Master Bookings"
  ON "Master Bookings"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert Master Bookings"
  ON "Master Bookings"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update Master Bookings"
  ON "Master Bookings"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_master_bookings_updated_at
    BEFORE UPDATE ON "Master Bookings"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();