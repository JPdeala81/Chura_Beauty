import { supabase } from '../config/supabase.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  })
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      })
    }

    // Récupérer l'admin
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1)
      .single()

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
    }

    const token = generateToken(admin.id)

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        salon_name: admin.salon_name,
        owner_name: admin.owner_name,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getAdmin = async (req, res) => {
  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.admin.id)
      .limit(1)
      .single()

    if (error || !admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    // Retirer le mot de passe
    const { password, ...adminWithoutPassword } = admin

    res.status(200).json({
      success: true,
      admin: adminWithoutPassword,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateAdmin = async (req, res) => {
  try {
    const {
      salon_name,
      owner_name,
      phone,
      whatsapp,
      address,
      bio,
      instagram,
      facebook,
      profile_picture,
      cover_picture,
    } = req.body

    const { data: admin, error } = await supabase
      .from('admins')
      .update({
        salon_name,
        owner_name,
        phone,
        whatsapp,
        address,
        bio,
        instagram,
        facebook,
        profile_picture: profile_picture || undefined,
        cover_picture: cover_picture || undefined,
      })
      .eq('id', req.admin.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    // Retirer le mot de passe
    const { password, ...adminWithoutPassword } = admin

    res.status(200).json({
      success: true,
      admin: adminWithoutPassword,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Récupérer l'admin actuel
    const { data: admin, error: selectError } = await supabase
      .from('admins')
      .select('password')
      .eq('id', req.admin.id)
      .limit(1)
      .single()

    if (selectError || !admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, admin.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
    }

    // Hash le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Mettre à jour
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: hashedNewPassword })
      .eq('id', req.admin.id)

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updatePaymentConfig = async (req, res) => {
  try {
    const { airtel_code, moov_code, is_payment_enabled } = req.body

    const { data: admin, error } = await supabase
      .from('admins')
      .update({
        airtel_code,
        moov_code,
        is_payment_enabled: is_payment_enabled || false,
      })
      .eq('id', req.admin.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    // Retirer le mot de passe
    const { password, ...adminWithoutPassword } = admin

    res.status(200).json({
      success: true,
      admin: adminWithoutPassword,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
