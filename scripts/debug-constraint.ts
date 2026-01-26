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

async function debug() {
  const testValues = ['sentence', 'character', 'OneSentence', 'OneChar', '1 câu', '1 kí tự'];
  
  for (const val of testValues) {
    console.log(`Testing limit_type: "${val}"...`);
    const { error } = await supabase.from("works").insert({
        title: "Debug Test",
        category_type: 'Văn xuôi',
        period: 'Hiện đại',
        limit_type: val,
        status: 'writing',
        created_by: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        author_nickname: 'Debugger'
    });
    
    if (error) {
        console.log(`- FAILED: ${error.message} (Code: ${error.code})`);
    } else {
        console.log(`- SUCCESS!`);
        // Clean up
        await supabase.from("works").delete().eq("title", "Debug Test");
    }
  }
}

debug();
