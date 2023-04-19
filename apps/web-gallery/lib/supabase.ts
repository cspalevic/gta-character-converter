import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const { SUPABASE_PROJECT_URL = "", SUPABASE_API_KEY = "" } = process.env;
if (!SUPABASE_PROJECT_URL) {
  console.warn("Supabase Project URL not set!");
}
if (!SUPABASE_API_KEY) {
  console.warn("Supabase API Key not set!");
}

const uploadSchema = z.object({
  reference_id: z.string(),
  created_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().nullable(),
  name: z.string().nullable(),
  status: z.enum(["started", "completed"]),
});

const conversionSchema = z.object({
  replicate_id: z.string(),
  upload_reference_id: z.string(),
  status: z.enum(["started", "completed", "failed", "canceled"]),
  message: z.string().nullable(),
  url: z.string().nullable(),
});

export type Upload = z.infer<typeof uploadSchema>;
export type Conversion = z.infer<typeof conversionSchema>;

export type Table<T> = {
  Row: T;
  Insert: T;
  Update: Partial<T>;
};

type Database = {
  public: {
    Tables: {
      upload: Table<Upload>;
      conversion: Table<Conversion>;
    };
  };
};

const supabase = createClient<Database>(SUPABASE_PROJECT_URL, SUPABASE_API_KEY);

export const getClient = <T extends keyof Database["public"]["Tables"]>(
  tableName: T
) =>
  supabase.from<typeof tableName, Database["public"]["Tables"][T]>(tableName);
