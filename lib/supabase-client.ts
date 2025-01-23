import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://svwxrarsmgorbnaeybkx.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d3hyYXJzbWdvcmJuYWV5Ymt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NTEzOTQsImV4cCI6MjA1MzIyNzM5NH0.BLOPI7Rc5S90swhjAhgJwZN--Tq1cqmmXnwM1gAdAdc"

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

