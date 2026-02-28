import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Use service role if available for admin queries

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // We cannot query pg_trigger directly through standard REST API unless exposed.
    // Let's try to fetch a record to see what happens and log the exact error
    const { data, error } = await supabase
      .from('contributions')
      .insert([
        {
          work_id: 'f9aa33fd-c5c3-4e59-a999-d6f9d4b103e1',                 
          user_id: '00000000-0000-0000-0000-000000000000',             
          content: 'Test content',                
          author_nickname: 'Hệ thống'     
        }
      ]);
      
    console.log("Insert Test Result:");
    console.log("Data:", data);
    if (error) {
        console.error("Error Details:", JSON.stringify(error, null, 2));
    }
}

run().catch(console.error);
