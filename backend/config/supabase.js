import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

// In development mode, allow mock credentials for testing
const isDevelopment = process.env.NODE_ENV === 'development'

if (!supabaseUrl && !isDevelopment) {
  throw new Error('Les variables SUPABASE_URL doivent être définis en production')
}

if (!supabaseKey && !isDevelopment) {
  throw new Error('Les variables SUPABASE_SERVICE_KEY doivent être définis en production')
}

// Use mock values if not provided in development
const url = supabaseUrl || 'https://mock.supabase.co'
const key = supabaseKey || 'mock-key-for-development'

export const supabase = createClient(url, key)
export default supabase
