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

async function checkWorks() {
  console.log("Checking works table with anon key...");
  const { data, error } = await supabase
    .from("works")
    .select("*");

  if (error) {
    console.error("Error fetching works:", error);
  } else {
    console.log(`Found ${data.length} works visible to anon user.`);
    data.forEach(w => {
        console.log(`- ID: ${w.id}, Title: ${w.title}, Status: ${w.status}, License: ${w.license}, CreatedBy: ${w.created_by}`);
    });
  }
}

checkWorks();
