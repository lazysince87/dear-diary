const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server uses the SERVICE ROLE key — this bypasses RLS and can verify JWTs
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };