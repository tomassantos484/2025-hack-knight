import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://ilnffpgpzwxnwdobwutf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey); 