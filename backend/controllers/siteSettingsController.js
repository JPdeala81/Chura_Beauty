import { supabase } from '../config/supabase.js'

export const getSiteSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single()
    if (error) return res.status(404).json({ success: false, message: 'Settings not found' })
    res.json(data)
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

export const updateSiteSettings = async (req, res) => {
  try {
    const { favicon_emoji, favicon_image, hero_animation, hero_cta_text, hero_cta2_text, navbar_cta_text, admin_btn_text } = req.body
    const { data, error } = await supabase
      .from('site_settings')
      .update({
        favicon_emoji,
        favicon_image,
        hero_animation,
        hero_cta_text,
        hero_cta2_text,
        navbar_cta_text,
        admin_btn_text,
        updated_at: new Date()
      })
      .eq('id', req.admin.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

export const getMaintenanceStatus = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('is_maintenance, maintenance_end, maintenance_reason')
      .single()
    if (error) return res.json({ is_maintenance: false })
    res.json(data)
  } catch (e) {
    res.json({ is_maintenance: false })
  }
}

export const enableMaintenance = async (req, res) => {
  try {
    const { reason = 'Maintenance en cours', durationMinutes = 60 } = req.body
    const maintenanceEnd = new Date(Date.now() + durationMinutes * 60000)
    const { data, error } = await supabase
      .from('site_settings')
      .update({
        is_maintenance: true,
        maintenance_reason: reason,
        maintenance_end: maintenanceEnd.toISOString()
      })
      .eq('id', req.admin.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

export const disableMaintenance = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .update({
        is_maintenance: false,
        maintenance_end: null,
        maintenance_reason: null
      })
      .eq('id', req.admin.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}

export const getAdminStats = async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('admins')
      .select('id', { count: 'exact' })
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .gte('appointment_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    const { data: services } = await supabase
      .from('services')
      .select('id', { count: 'exact' })
    res.json({
      total_users: users?.length || 0,
      appointments_month: appointments?.length || 0,
      total_services: services?.length || 0,
      error_count: 0,
      uptime: 99.9,
      requests_today: 0
    })
  } catch (e) {
    res.status(500).json({ success: false, message: e.message })
  }
}
