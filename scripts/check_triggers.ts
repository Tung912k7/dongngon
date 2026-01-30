import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach(line => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    });
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkTriggers() {
    console.log("Checking Triggers on Works...");
    // We can't query pg_trigger directly via anonymous key usually, 
    // but maybe there's an RPC or we can try.
    const { data, error } = await supabase.rpc('get_triggers', { t_name: 'works' });
    if (error) {
        console.log("RPC get_triggers failed (as expected). Trying direct query...");
        const { data: direct, error: directError } = await supabase.from('pg_trigger').select('*');
        if (directError) console.log("Direct query failed too.");
    } else {
        console.log("Triggers:", data);
    }
}

checkTriggers();
