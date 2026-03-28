import { supabase } from '../config/supabase.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const seedAdmin = async () => {
  try {
    // Vérifier si admin existe
    const { data: existingAdmin, error: selectError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', process.env.ADMIN_EMAIL)
      .limit(1)

    if (selectError) {
      console.error('❌ Erreur lors de la vérification du admin:', selectError.message)
      process.exit(1)
    }

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin déjà existant:', existingAdmin[0].email)
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)

    // Créer le nouvel admin
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert({
        salon_name: process.env.SALON_NAME || 'Chura Beauty Salon',
        owner_name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        phone: process.env.ADMIN_PHONE || '+241000000000',
        whatsapp: process.env.ADMIN_WHATSAPP || '+241000000000',
        address: process.env.ADMIN_ADDRESS || 'Libreville, Gabon',
      })
      .select()

    if (insertError) {
      console.error('❌ Erreur lors de la création du admin:', insertError.message)
      process.exit(1)
    }

    console.log('✅ Admin créé avec succès!')
    console.log('📧 Email:', process.env.ADMIN_EMAIL)
    console.log('🔐 Password: Voir .env (ADMIN_PASSWORD)')
    console.log('💾 Admin ID:', newAdmin[0]?.id)
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

seedAdmin()
