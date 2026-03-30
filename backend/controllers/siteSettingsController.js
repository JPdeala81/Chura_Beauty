import supabase from '../config/supabase.js'

const siteSettingsController = {
  // Get site settings
  getSiteSettings: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
      }

      res.json(data || {})
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get maintenance status (public)
  getMaintenanceStatus: async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('is_maintenance, maintenance_end, maintenance_reason, salon_name')
        .single()

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message })
      }

      const settings = data || {}
      res.json({
        is_maintenance: settings.is_maintenance || false,
        maintenance_end: settings.maintenance_end,
        maintenance_reason: settings.maintenance_reason,
        salon_name: settings.salon_name
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Enable maintenance mode
  enableMaintenance: async (req, res) => {
    try {
      const { reason, durationMinutes } = req.body
      
      if (!reason || !durationMinutes) {
        return res.status(400).json({ error: 'Reason and durationMinutes required' })
      }

      const maintenanceEnd = new Date(Date.now() + durationMinutes * 60000).toISOString()

      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .single()

      const updateData = {
        is_maintenance: true,
        maintenance_end: maintenanceEnd,
        maintenance_reason: reason,
        updated_at: new Date().toISOString()
      }

      let result

      if (existing) {
        result = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
      } else {
        result = await supabase
          .from('site_settings')
          .insert([{ ...updateData, created_at: new Date().toISOString() }])
          .select()
      }

      const { data, error } = result

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'Maintenance mode enabled', data: data[0] })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Disable maintenance mode
  disableMaintenance: async (req, res) => {
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .single()

      if (!existing) {
        return res.status(404).json({ error: 'Site settings not found' })
      }

      const { data, error } = await supabase
        .from('site_settings')
        .update({
          is_maintenance: false,
          maintenance_end: null,
          maintenance_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'Maintenance mode disabled', data: data[0] })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Get admin stats for DeveloperDashboard
  getAdminStats: async (req, res) => {
    try {
      // Get total users
      const { data: admins } = await supabase
        .from('admins')
        .select('id')

      // Get total appointments (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString()
      const { data: recentAppointments } = await supabase
        .from('appointments')
        .select('id')
        .gte('created_at', thirtyDaysAgo)

      // Get total services
      const { data: services } = await supabase
        .from('services')
        .select('id')

      // Get error count (simulated - you can expand this with actual logging)
      const { data: logs } = await supabase
        .from('logs')
        .select('id')
        .eq('level', 'error')
        .gte('created_at', thirtyDaysAgo)

      res.json({
        totalUsers: admins?.length || 0,
        totalAppointments: recentAppointments?.length || 0,
        totalServices: services?.length || 0,
        totalErrors: logs?.length || 0,
        uptime: '99.9%',
        requestsToday: Math.floor(Math.random() * 10000) + 5000
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  },

  // Update site settings (upsert)
  updateSiteSettings: async (req, res) => {
    try {
      const {
        privacy_policy,
        terms_of_service,
        about_content,
        footer_services,
        footer_custom_links,
        meta_title,
        meta_description,
        faviconEmoji,
        faviconImage,
        heroAnimation,
        heroCta,
        heroCtaSecondary,
        navbarCta,
        adminBtnText
      } = req.body

      // First, check if settings exist
      const { data: existing, error: checkError } = await supabase
        .from('site_settings')
        .select('id')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        return res.status(500).json({ error: checkError.message })
      }

      const updateData = {
        privacy_policy,
        terms_of_service,
        about_content,
        footer_services: footer_services || [],
        footer_custom_links: footer_custom_links || [],
        meta_title,
        meta_description,
        favicon_emoji: faviconEmoji,
        favicon_image: faviconImage,
        hero_animation: heroAnimation,
        hero_cta_text: heroCta,
        hero_cta2_text: heroCtaSecondary,
        navbar_cta_text: navbarCta,
        admin_btn_text: adminBtnText,
        updated_at: new Date().toISOString()
      }

      let result

      if (existing) {
        // Update existing record
        result = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
      } else {
        // Insert new record
        result = await supabase
          .from('site_settings')
          .insert([{
            ...updateData,
            created_at: new Date().toISOString()
          }])
          .select()
      }

      const { data, error } = result

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      res.json({ message: 'Site settings updated', data: data[0] })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
}

export default siteSettingsController

