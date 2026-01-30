import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnInfo() {
  const { data, error } = await supabase.rpc('get_column_info', { table_name: 'profiles' });
  if (error) {
    // Fallback: try to query information_schema if RPC doesn't exist
    const { data: info, error: infoError } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profiles sample:", info);
    console.log("Note: Use SQL to check actual column constraints.");
  } else {
    console.log("Column Info:", data);
  }
}

checkColumnInfo();
