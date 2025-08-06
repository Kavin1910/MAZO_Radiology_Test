
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://coufmapjvhlmkzktuhuv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdWZtYXBqdmhsbWt6a3R1aHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODUzMjcsImV4cCI6MjA2NjI2MTMyN30.myjFmNjkWzpcT9ctfzY74lVJPcW-t8RA_Dj6jNd_FHE';

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
