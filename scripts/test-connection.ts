import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};

envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
    envVars[key] = value;
  }
});

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_ANON_KEY = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.log("Found:", Object.keys(envVars));
  process.exit(1);
}

console.log(`Checking connection to: ${SUPABASE_URL}`);

// 2. Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    const start = Date.now();
    // Try to fetch 1 row from 'works' table (or check health)
    const { data, error, count } = await supabase
      .from("works")
      .select("*", { count: "exact", head: true });

    const duration = Date.now() - start;

    if (error) {
      console.error("❌ Connection Failed:", error.message);
      if (error.code === "PGRST301") {
         console.error("Hint: Check if your Row Level Security (RLS) policies allow access.");
      }
    } else {
      console.log("✅ Connection Successful!");
      console.log(`⏱️  Response time: ${duration}ms`);
      console.log(`📊 Total works found: ${count}`);
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
  }
}

testConnection();
