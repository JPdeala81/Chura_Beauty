import { supabase } from '../config/supabase.js'

export const getOwnerProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, salon_name, owner_name, phone, whatsapp, address, bio, instagram, facebook, profile_photo, favicon_emoji, created_at')
      .limit(1)
      .single()
    if (error) return res.status(404).json({ success: false })
    res.json({
      ...data,
      site_created_at: data.created_at
    })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}
