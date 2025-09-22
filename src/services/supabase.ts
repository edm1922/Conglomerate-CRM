import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anon key are missing from environment variables.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') && !supabaseUrl.startsWith('http://')) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Must be a valid HTTP or HTTPS URL.`);
}

// Additional validation for common issues
if (supabaseUrl.includes('your_supabase_url_here') || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  throw new Error('Please replace placeholder values in your .env file with actual Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
