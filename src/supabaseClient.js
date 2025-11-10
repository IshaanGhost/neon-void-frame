import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wmddiudmxsgejrppnlpe.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZGRpdWRteHNnZWpycHBubHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEzNjAsImV4cCI6MjA3ODM0NzM2MH0.o45MwLMIvyjid-ynoZRDyoNARzecqqtGVYd5wwWnEpk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

