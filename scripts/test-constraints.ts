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

async function checkConstraints() {
  const rules = ['OneSentence', 'OneChar', '1_sentence_day', '1 câu'];
  
  console.log("Testing limit_type...");
  for (const rule of rules) {
    const { error } = await supabase.from("works").insert({
        title: "Test",
        created_by: "00000000-0000-0000-0000-000000000000",
        category_type: 'Thơ',
        period: 'Hiện đại',
        limit_type: rule,
        status: 'active'
    });
    if (error && error.message.includes('works_limit_type_check')) {
        console.log(`Testing "${rule}": FAILED check constraint`);
    } else if (error) {
        console.log(`Testing "${rule}": Passed check constraint (but error: ${error.message})`);
    } else {
        console.log(`Testing "${rule}": SUCCESS!`);
    }
  }
}

checkConstraints();
