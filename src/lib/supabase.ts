import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gnqhjcmvyhhodjghpuop.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducWhqY212eWhob2RqZ2hwdW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3ODQwMDAsImV4cCI6MjA4ODM2MDAwMH0.4Grr-V1e-VUJR_cFCcDzAyWX1hlk4coguMR59r6TOvA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
