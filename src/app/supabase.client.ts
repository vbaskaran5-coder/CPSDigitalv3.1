import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Your provided Supabase credentials
const supabaseUrl = 'https://akccppibkxkrseuaoquk.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrY2NwcGlia3hrcnNldWFvcXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjE3MTQsImV4cCI6MjA3NzMzNzcxNH0.LJRmeTB-S4NK0m9EyDxL31SXp-O6jsaXAKNvf17bylg';

/**
 * Creates and exports the Supabase client.
 * This client is typed with the 'Database' interface generated from your schema,
 * providing full type safety for all database operations.
 *
 * This 'anon' key is safe to use in a client-side application provided you
 * have Row Level Security (RLS) enabled on your database tables.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
