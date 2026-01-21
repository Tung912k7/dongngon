import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    envVars[key] = value;
  }
});

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_ANON_KEY = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getColumnInfo() {
  // Query to get column names for the 'works' table
  // Since we can't easily query information_schema via RPC or raw SQL directly without a defined RPC,
  // we can try to get a single row and look at the keys, IF we can find one.
  // Or we can try to intentionally trigger an 'undefined column' error to see if it lists columns? No.
  
  // Let's try to query a system table that might be exposed or just try a row if it exists.
  const { data, error } = await supabase.from("works").select("*").limit(1);
  if (data && data.length > 0) {
    console.log("Columns found in a row:", Object.keys(data[0]));
    console.log("Sample row:", data[0]);
  } else {
    console.log("Table is empty, trying another way...");
    // If the table is empty, we can't see columns this way.
    // Let's try to find ANY row in any table that might refer to it? No.
    
    // Let's try to check the 'contributions' table if it has a foreign key or something?
    const { data: contrib } = await supabase.from("contributions").select("*").limit(1);
    if (contrib && contrib.length > 0) {
        console.log("Contribution row:", contrib[0]);
    }
  }
}

getColumnInfo();
