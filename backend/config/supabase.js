import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use mock values if not provided
const url = supabaseUrl || 'https://mock.supabase.co'
const key = supabaseKey || 'mock-key-for-development'

// Log warning if credentials are missing in production
if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Supabase credentials not fully configured in production. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables.')
  }
}

export const supabase = createClient(url, key)
export default supabase
