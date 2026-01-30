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

async function testUpdate() {
    const workId = "b100597a-84f0-4b90-a2c5-89578385d003"; // Rapid Submit Test
    console.log(`Testing update for ${workId}...`);
    
    const { data, error } = await supabase
        .from("works")
        .update({ status: "finished" })
        .eq("id", workId)
        .select();
    
    if (error) {
        console.error("Update Error:", error);
    } else {
        console.log("Update Success! New Data:", data);
    }
}

testUpdate();
