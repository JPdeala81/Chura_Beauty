import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../config/supabase.js'
import bcrypt from 'bcryptjs'

const seedAdmin = async () => {
  try {
    console.log('🔄 Initialisation du super administrateur...\n')

    // Vérifier si les variables existent
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error('❌ ERREUR : ADMIN_EMAIL et ADMIN_PASSWORD ne sont pas définis dans .env')
      process.exit(1)
    }

    // Vérifier si admin existe
    console.log('🔍 Vérification si l\'admin existe déjà...')
    const { data: existingAdmin, error: selectError } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('email', process.env.ADMIN_EMAIL)
      .limit(1)

    if (selectError) {
      console.error('❌ Erreur lors de la vérification du admin:', selectError.message)
      process.exit(1)
    }

    if (existingAdmin && existingAdmin.length > 0) {
      console.log('✅ Admin existe déjà !')
      console.log(`   Email: ${existingAdmin[0].email}`)
      console.log(`   Rôle: ${existingAdmin[0].role || 'admin'}`)
      process.exit(0)
    }

    // Hash password
    console.log('🔐 Hashage du mot de passe...')
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
    console.log('✅ Mot de passe hashé')

    // Créer le nouvel admin
    console.log('\n📝 Création du super administrateur en base de données...')
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert({
        salon_name: process.env.SALON_NAME || 'Chura Beauty Salon',
        owner_name: process.env.ADMIN_NAME || 'Administratrice',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        phone: process.env.ADMIN_PHONE || '+241000000000',
        whatsapp: process.env.ADMIN_WHATSAPP || '+241000000000',
        address: process.env.ADMIN_ADDRESS || 'Libreville, Gabon',
        role: 'super_admin',
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error('❌ Erreur lors de la création du admin:', insertError.message)
      process.exit(1)
    }

    console.log('\n✅ ✅ ✅ SUCCÈS ! Super administrateur créé ! ✅ ✅ ✅\n')
    console.log('📊 Détails :')
    console.log(`   ID: ${newAdmin[0]?.id}`)
    console.log(`   Email: ${newAdmin[0]?.email}`)
    console.log(`   Rôle: ${newAdmin[0]?.role}`)
    console.log(`   Salon: ${newAdmin[0]?.salon_name}`)
    console.log(`   Créé à: ${newAdmin[0]?.created_at}`)
    console.log('\n🔑 Identifiants de connexion :')
    console.log(`   Email: ${process.env.ADMIN_EMAIL}`)
    console.log(`   Password: ${process.env.ADMIN_PASSWORD}`)
    console.log('\n👉 Tu peux maintenant te connecter via le formulaire admin !\n')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

seedAdmin()
