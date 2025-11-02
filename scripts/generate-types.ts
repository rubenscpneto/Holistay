/**
 * Script to generate TypeScript types from Supabase database schema
 * 
 * Usage:
 * 1. Make sure you have Supabase CLI installed: npm install -g supabase
 * 2. Login to Supabase: supabase login
 * 3. Link your project: supabase link --project-ref your-project-ref
 * 4. Run this script: npx tsx scripts/generate-types.ts
 * 
 * Or use the Supabase dashboard:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to Settings > API
 * 3. Copy your project URL and anon key
 * 4. Set them as environment variables and use supabase gen types
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set");
  console.error("Please create a .env.local file with your Supabase credentials");
  process.exit(1);
}

try {
  console.log("Generating TypeScript types from Supabase schema...");
  
  // Generate types using Supabase CLI
  const output = execSync(
    `npx supabase gen types typescript --project-id ${SUPABASE_URL.split("//")[1].split(".")[0]} > types/supabase.ts`,
    { encoding: "utf-8" }
  );
  
  console.log("Types generated successfully at types/supabase.ts");
} catch (error) {
  console.error("Error generating types:", error);
  console.log("\nAlternative: Use the Supabase dashboard to generate types:");
  console.log("1. Go to Settings > API in your Supabase dashboard");
  console.log("2. Scroll down to 'Project API keys'");
  console.log("3. Copy the types using the 'Generate TypeScript types' button");
  console.log("4. Save them to types/supabase.ts");
  process.exit(1);
}

