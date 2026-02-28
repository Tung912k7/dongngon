import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Let's use the REST API to try to query pg_trigger if it's exposed, though it's usually not.
    // Instead, I'll log all the properties of the error that returns.
    const { data: errorPayload, error } = await supabase
      .from('contributions')
      .insert([
        {
          work_id: 'f9aa33fd-c5c3-4e59-a999-d6f9d4b103e1',                 
          user_id: '00000000-0000-0000-0000-000000000000',             
          content: 'Test content',                
          author_nickname: 'Hệ thống'     
        }
      ]);
      
    if (error) {
        console.log("Error object keys:", Object.keys(error));
        console.log("Error details property:", error.details);
        console.log("Error message:", error.message);
        console.log("Error hint:", error.hint);
        
        // Let's see if we can get the trigger name or table name from the Postgres error
        // The error object might have hidden properties if it's a PostgREST error.
        console.log("Full error stringified:", JSON.stringify(error, null, 2));
    }
}

run().catch(console.error);
