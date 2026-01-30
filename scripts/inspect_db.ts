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

async function inspectDb() {
  console.log("Checking Works table...");
  const { data: sample, error: sampleError } = await supabase.from('works').select('*').limit(1);
  if (sampleError) {
      console.error("Error fetching works:", sampleError);
  } else if (sample && sample.length > 0) {
      console.log("Works Columns:", Object.keys(sample[0]));
      console.log("Sample Data Status:", sample[0].status);
  }

  console.log("\nChecking works status...");
  const { data: probe, error: probeError } = await supabase
    .from("works")
    .select("id, title, status, created_by")
    .or("title.ilike.%Test%Bug%,title.ilike.%Rapid Submit%");
  
  if (probeError) {
      console.error("Error probing works:", probeError);
  } else if (probe && probe.length > 0) {
      console.log("Found problematic works:", JSON.stringify(probe, null, 2));
      const workId = probe[0].id;
      console.log(`\nDetailed inspection for work: ${probe[0].title} (${workId})`);
      
      const { data: contributions } = await supabase.from("contributions").select("*").eq("work_id", workId);
      const { data: votes } = await supabase.from("finish_votes").select("*").eq("work_id", workId);
      
      const uniqueContributors = new Set(contributions?.map(c => c.user_id) || []).size;
      const threshold = Math.max(1, Math.floor(uniqueContributors / 2) + 1);
      
      console.log("Unique Contributors:", uniqueContributors);
      console.log("Threshold:", threshold);
      console.log("Vote Count:", votes?.length || 0);
      console.log("System Marker Present:", contributions?.some(c => c.author_nickname === 'Hệ thống'));
      
      if (contributions) {
          console.log("Last contribution:", JSON.stringify(contributions[contributions.length - 1], null, 2));
      }
  } else {
      console.log("No probe works found.");
  }
}

inspectDb();
