import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
      .from("works")
      .select("id, title, status, limit_type, sub_category, privacy, created_by, age_rating, author_nickname, author:profiles(display_name, nickname)")
      .limit(1)
      .single();

    console.log("Data:", data);
    console.log("Error:", error);
}

run().catch(console.error);
