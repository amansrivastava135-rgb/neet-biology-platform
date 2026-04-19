import { createClient } from "@supabase/supabase-js";

// Server-side only — sirf API routes aur server components mein import karo
// Client components mein kabhi import mat karna
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);