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

async function inspectContributions() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Get all contributions
  const { data, error } = await supabase.from("contributions").select("*, works(title)").limit(10);
  
  if (error) {
    console.error("Error fetching contributions:", error);
  } else {
    console.log("Contributions count:", data.length);
    if (data.length > 0) {
      console.log("Sample Contribution:", JSON.stringify(data[0], null, 2));
    }
  }
}

inspectContributions();
