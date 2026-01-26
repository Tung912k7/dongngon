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

async function diagnose() {
  console.log("Starting diagnostic test for 'works' table constraints...");

  const tests = [
    { name: "Current Mapping (sentence)", data: { title: "D1", category_type: "Văn xuôi", period: "Hiện đại", limit_type: "sentence", status: "active", license: "public", author_nickname: "D" } },
    { name: "Alt Mapping (OneSentence)", data: { title: "D2", category_type: "Văn xuôi", period: "Hiện đại", limit_type: "OneSentence", status: "active", license: "public", author_nickname: "D" } },
    { name: "Legacy Status (writing)", data: { title: "D3", category_type: "Văn xuôi", period: "Hiện đại", limit_type: "sentence", status: "writing", license: "public", author_nickname: "D" } },
    { name: "Upper Case Category", data: { title: "D4", category_type: "Prose", period: "Hiện đại", limit_type: "sentence", status: "active", license: "public", author_nickname: "D" } },
    { name: "Upper Case Period", data: { title: "D5", category_type: "Văn xuôi", period: "Modern", limit_type: "sentence", status: "active", license: "public", author_nickname: "D" } },
    { name: "Minimal Set", data: { title: "D6", status: "active" } },
  ];

  for (const test of tests) {
    const { error } = await supabase.from("works").insert({
        ...test.data,
        created_by: '00000000-0000-0000-0000-000000000000'
    });
    
    if (error) {
        console.log(`Test [${test.name}]: CODE ${error.code} | MSG: ${error.message}`);
    } else {
        console.log(`Test [${test.name}]: SUCCESS`);
        await supabase.from("works").delete().eq("title", test.data.title);
    }
  }
}

diagnose();
