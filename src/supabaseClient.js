import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eohtzkldahhzgjllmrle.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvaHR6a2xkYWhoemdqbGxtcmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzkyMTksImV4cCI6MjA3MDA1NTIxOX0.i-XsGWSJcm8OsNa6CDnIQJmrNVOMVMyAj5RQSy1LUPsKEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
