import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  console.error('❌ SUPABASE_URL and (SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY) required in .env')
  process.exit(1)
}

// Use SERVICE KEY to bypass RLS, fallback to anon key
const key = supabaseServiceKey || supabaseAnonKey
const supabase = createClient(supabaseUrl, key)

async function createDeveloperUser() {
  try {
    // Developer credentials
    const developerData = {
      email: 'developer@chura-beauty.dev',
      password: 'Dev@Chura2024!',
      salon_name: 'Chura Beauty Dev',
      owner_name: 'Developer Account',
      role: 'developer',
      phone: '+264 81 000 0001',
      address: 'Development Server',
      bio: 'Developer Administration Account'
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(developerData.password, 10)

    // Insert into admins table
    const { data, error } = await supabase
      .from('admins')
      .insert([
        {
          email: developerData.email,
          password: hashedPassword,
          salon_name: developerData.salon_name,
          owner_name: developerData.owner_name,
          role: developerData.role,
          phone: developerData.phone,
          address: developerData.address,
          bio: developerData.bio,
          is_first_login: true
        }
      ])
      .select()

    if (error) {
      console.error('❌ Error creating developer user:', error.message)
      process.exit(1)
    }

    console.log('✅ Developer user created successfully!\n')
    console.log('📋 DEVELOPER USER CREDENTIALS:')
    console.log('================================')
    console.log(`📧 Email: ${developerData.email}`)
    console.log(`🔑 Password: ${developerData.password}`)
    console.log(`🔧 Role: ${developerData.role}`)
    console.log(`📞 Phone: ${developerData.phone}`)
    console.log(`🏢 Salon Name: ${developerData.salon_name}`)
    console.log(`👤 Owner Name: ${developerData.owner_name}`)
    console.log('================================\n')
    console.log('✨ Login URL: /admin/login')
    console.log('✨ Dashboard URL: /admin/developer')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

createDeveloperUser()
