import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // Attempting to pass `created_by` to see if it fixes the error or throws "column does not exist".
    const { data: errorPayload, error } = await supabase
      .from('contributions')
      .insert([
        {
          work_id: 'f9aa33fd-c5c3-4e59-a999-d6f9d4b103e1',                 
          user_id: '00000000-0000-0000-0000-000000000000',  
          created_by: '00000000-0000-0000-0000-000000000000',           
          content: 'Test content',                
          author_nickname: 'Hệ thống'     
        }
      ]);
      
    if (error) {
        console.log("Error object:", error.code, error.message);
    } else {
        console.log("Success! The column exists.");
    }
}

run().catch(console.error);
