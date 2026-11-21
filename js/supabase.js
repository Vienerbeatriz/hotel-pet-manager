
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://crgmybydgjphvohzrcis.supabase.co";

const SUPABASE_KEY = "sb_publishable_p-JkwAXA-B56mFyHK5_PhQ_t4qF3TMr";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

export default supabase;
