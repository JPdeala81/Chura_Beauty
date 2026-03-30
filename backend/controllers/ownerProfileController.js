import supabase from '../config/supabase.js'

export const getOwnerProfile = async (req, res) => {
  try {
    const { slug } = req.params

    // If slug provided, fetch that specific owner's profile
    if (slug && slug !== 'undefined') {
      // You can implement slug-based lookup - for now, we'll fetch the first admin
      const { data: admin, error } = await supabase
        .from('admins')
        .select(`
          id,
          email,
          salon_name,
          owner_name,
          phone,
          whatsapp,
          address,
          bio,
          instagram,
          facebook,
          profile_photo,
          favicon_emoji,
          created_at
        `)
        .limit(1)
        .single()

      if (error || !admin) {
        return res.status(404).json({ error: 'Owner profile not found' })
      }

      const { data: siteSettings } = await supabase
        .from('site_settings')
        .select('site_created_at')
        .single()

      return res.json({
        ...admin,
        site_created_at: siteSettings?.site_created_at || admin.created_at
      })
    }

    // Fallback: fetch first admin as default owner
    const { data: admin, error } = await supabase
      .from('admins')
      .select(`
        id,
        email,
        salon_name,
        owner_name,
        phone,
        whatsapp,
        address,
        bio,
        instagram,
        facebook,
        profile_photo,
        favicon_emoji,
        created_at
      `)
      .limit(1)
      .single()

    if (error || !admin) {
      return res.status(404).json({ error: 'No owner profile found' })
    }

    const { data: siteSettings } = await supabase
      .from('site_settings')
      .select('site_created_at')
      .single()

    res.json({
      ...admin,
      site_created_at: siteSettings?.site_created_at || admin.created_at
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
