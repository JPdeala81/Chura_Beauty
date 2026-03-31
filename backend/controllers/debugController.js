import { supabase } from '../config/supabase.js'

// GET ALL ADMINS FOR DEBUGGING - DEVELOPMENT ONLY
export const getAllAdmins = async (req, res) => {
  try {
    // Récupérer tous les admins depuis Supabase
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, email, owner_name, salon_name, role, password, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur Supabase: ' + error.message,
      })
    }

    // Vérifier que les passwords sont correctement hashés
    const adminsWithPasswordStatus = admins.map(admin => ({
      ...admin,
      password_status: admin.password ? (admin.password.startsWith('$2') ? 'Hashé (bcrypt)' : 'PAS HASHÉ!') : 'Absent'
    }))

    res.status(200).json({
      success: true,
      count: admins.length,
      admins: adminsWithPasswordStatus,
      message: `${admins.length} utilisateur(s) trouvé(s) en base de données`
    })
  } catch (error) {
    console.error('Debug auth error:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + error.message,
    })
  }
}
