import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://teizuwbyaartxfbrpggu.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaXp1d2J5YWFydHhmYnJwZ2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE2OTkwMTYsImV4cCI6MjAxNzI3NTAxNn0.xH6Mn0YBfsiUTmAi0eQ7b_NfkXxKxD5VMhBDzoWvXgc";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
