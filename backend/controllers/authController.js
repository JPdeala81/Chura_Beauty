import nodemailer from 'nodemailer'
import crypto from 'crypto'

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Champs requis.' });
    }
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', req.admin.id)
      .single();
    if (error || !admin) return res.status(401).json({ message: 'Admin introuvable.' });
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('admins').update({ password: hashed }).eq('id', req.admin.id);
    res.json({ message: 'Mot de passe modifié.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// UPDATE SECURITY
export const updateSecurity = async (req, res) => {
  try {
    const { secretQuestion, secretAnswer, recoveryEmail } = req.body;
    if (!secretQuestion || !secretAnswer || !recoveryEmail) {
      return res.status(400).json({ message: 'Champs requis.' });
    }
    const hashedAnswer = await bcrypt.hash(secretAnswer, 10);
    await supabase.from('admins').update({
      secret_question: secretQuestion,
      secret_answer: hashedAnswer,
      recovery_email: recoveryEmail,
      is_first_login: false
    }).eq('id', req.admin.id);
    res.json({ message: 'Sécurité mise à jour.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// FORGOT PASSWORD (send email)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis.' });
    const { data: admin, error } = await supabase.from('admins').select('*').eq('email', email).single();
    if (error || !admin) return res.status(404).json({ message: 'Admin introuvable.' });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await supabase.from('admins').update({ reset_token: token, reset_token_expires: expires.toISOString() }).eq('id', admin.id);
    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: admin.recovery_email || admin.email,
      subject: 'Réinitialisation du mot de passe',
      html: `<p>Bonjour,<br/>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetUrl}">${resetUrl}</a><br/>Ce lien expire dans 30 minutes.</p>`
    });
    res.json({ message: 'Email envoyé.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// RECOVER WITH QUESTION
export const recoverWithQuestion = async (req, res) => {
  try {
    const { email, secretAnswer } = req.body;
    if (!email || !secretAnswer) return res.status(400).json({ message: 'Champs requis.' });
    const { data: admin, error } = await supabase.from('admins').select('*').eq('email', email).single();
    if (error || !admin) return res.status(404).json({ message: 'Admin introuvable.' });
    const isMatch = await bcrypt.compare(secretAnswer, admin.secret_answer);
    if (!isMatch) return res.status(401).json({ message: 'Réponse incorrecte.' });
    // Générer un token temporaire (réutilise reset_token)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30);
    await supabase.from('admins').update({ reset_token: token, reset_token_expires: expires.toISOString() }).eq('id', admin.id);
    // Envoyer email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password/${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: admin.recovery_email || admin.email,
      subject: 'Réinitialisation du mot de passe',
      html: `<p>Bonjour,<br/>Cliquez sur ce lien pour réinitialiser votre mot de passe : <a href="${resetUrl}">${resetUrl}</a><br/>Ce lien expire dans 30 minutes.</p>`
    });
    res.json({ message: 'Email envoyé.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Champs requis.' });
    const { data: admin, error } = await supabase.from('admins').select('*').eq('reset_token', token).single();
    if (error || !admin) return res.status(400).json({ message: 'Token invalide.' });
    if (!admin.reset_token_expires || new Date(admin.reset_token_expires) < new Date()) {
      return res.status(400).json({ message: 'Token expiré.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from('admins').update({ password: hashed, reset_token: null, reset_token_expires: null }).eq('id', admin.id);
    res.json({ message: 'Mot de passe réinitialisé.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
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
      email,
      password,
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
      hero_title,
      hero_subtitle,
      hero_bg_color,
      hero_text_color
    } = req.body

    // Préparer l'objet de mise à jour
    const updateData = {}
    
    // Ajouter les champs définis à l'objet de mise à jour
    if (salon_name !== undefined && salon_name !== '') updateData.salon_name = salon_name
    if (owner_name !== undefined && owner_name !== '') updateData.owner_name = owner_name
    if (phone !== undefined && phone !== '') updateData.phone = phone
    if (whatsapp !== undefined && whatsapp !== '') updateData.whatsapp = whatsapp
    if (address !== undefined && address !== '') updateData.address = address
    if (bio !== undefined && bio !== '') updateData.bio = bio
    if (instagram !== undefined && instagram !== '') updateData.instagram = instagram
    if (facebook !== undefined && facebook !== '') updateData.facebook = facebook
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture
    if (cover_picture !== undefined) updateData.cover_picture = cover_picture
    if (hero_title !== undefined && hero_title !== '') updateData.hero_title = hero_title
    if (hero_subtitle !== undefined && hero_subtitle !== '') updateData.hero_subtitle = hero_subtitle
    if (hero_bg_color !== undefined && hero_bg_color !== '') updateData.hero_bg_color = hero_bg_color
    if (hero_text_color !== undefined && hero_text_color !== '') updateData.hero_text_color = hero_text_color

    // Si email est fourni, ajouter
    if (email !== undefined && email !== '') {
      updateData.email = email
    }

    // Si password est fourni, hasher et ajouter
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .update(updateData)
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
    const { password: _, ...adminWithoutPassword } = admin

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
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
