import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard against missing env vars so the app doesn't white-screen
const isConfigured = supabaseUrl && supabaseAnonKey
    && !supabaseUrl.includes('your_supabase')
    && !supabaseAnonKey.includes('your_supabase');

export const supabaseConfigured = isConfigured;

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

