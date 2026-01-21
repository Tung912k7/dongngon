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

async function inspectWorks() {
  const { data, error } = await supabase.from("works").select("*").limit(1);
  if (error) {
    console.error("Error fetching work:", error);
  } else {
    console.log("Sample Work Data:", JSON.stringify(data[0], null, 2));
  }
}

inspectWorks();
