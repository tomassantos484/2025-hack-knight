import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL2_0 || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY2_0 || '';

export const supabase = createClient(supabaseUrl, supabaseKey); 