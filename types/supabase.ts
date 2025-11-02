/**
 * This file will be auto-generated when you run the type generation script.
 * 
 * To generate types:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref your-project-ref
 * 4. Generate: npx supabase gen types typescript --linked > types/supabase.ts
 * 
 * Or manually from Supabase Dashboard:
 * Settings > API > Generate TypeScript types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: "manager" | "owner"
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "manager" | "owner"
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "manager" | "owner"
          created_at?: string
        }
      }
      // Add other tables as needed after running the generation script
    }
  }
}

