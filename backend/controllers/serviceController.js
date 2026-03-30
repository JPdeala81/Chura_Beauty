import { supabase } from '../config/supabase.js'

export const getAllServices = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query

    // Try to get active services first
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice))
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice))
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    let { data: services, error } = await query.order('created_at', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error)
      return res.status(500).json({
        success: false,
        message: 'Error fetching services',
      })
    }

    // If no active services found, get all services (fallback)
    if (!services || services.length === 0) {
      console.warn('⚠️ No active services found, returning all services as fallback')
      const { data: fallbackServices, error: fallbackError } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (!fallbackError) {
        services = fallbackServices || []
      }
    }

    // Client-side filtering for search if we switched to fallback
    if (search) {
      services = services.filter(s =>
        (s.title && s.title.toLowerCase().includes(search.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
      )
    }

    console.log(`✅ Returning ${services?.length || 0} services`)

    res.status(200).json({
      success: true,
      services: services || [],
    })
  } catch (error) {
    console.error('Get all services error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getServiceById = async (req, res) => {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .limit(1)
      .single()

    if (error) {
      console.error('Supabase error fetching service:', error)
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    res.status(200).json({
      success: true,
      service,
    })
  } catch (error) {
    console.error('Get service by ID error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      main_image_index,
      display_style,
      checkbox_options,
    } = req.body

    if (!title || !description || !category || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, price, duration',
      })
    }

    const images = req.files ? req.files.map((file) => file.path) : []
    let parsedOptions = []
    
    console.log('📝 Creating service:', {
      title,
      imagesCount: images.length,
      imageUrls: images,
      is_active: true
    })
    
    try {
      if (checkbox_options) {
        parsedOptions = typeof checkbox_options === 'string' 
          ? JSON.parse(checkbox_options) 
          : checkbox_options
      }
    } catch (parseError) {
      console.error('Error parsing checkbox_options:', parseError)
    }

    const serviceData = {
      title,
      description,
      category,
      price: Number(price),
      duration: Number(duration),
      images: images.length > 0 ? images : [],
      main_image_index: main_image_index ? Number(main_image_index) : 0,
      display_style: display_style || 'card',
      checkbox_options: parsedOptions,
      is_active: true,
    }

    const { data: service, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        success: false,
        message: error.message,
        details: error.details,
      })
    }

    res.status(201).json({
      success: true,
      service: service && service.length > 0 ? service[0] : service,
    })
  } catch (error) {
    console.error('Create service error:', error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateService = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      duration,
      main_image_index,
      display_style,
      checkbox_options,
      is_active,
    } = req.body

    // Récupérer le service existant si j'ai besoin des images précédentes
    const { data: existingService, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', req.params.id)
      .limit(1)
      .single()

    if (fetchError || !existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    const images = req.files
      ? req.files.map((file) => file.path)
      : existingService.images

    const { data: service, error } = await supabase
      .from('services')
      .update({
        title,
        description,
        category,
        price: Number(price),
        duration: duration || existingService.duration,
        images,
        main_image_index: main_image_index !== undefined ? main_image_index : existingService.main_image_index,
        display_style: display_style || existingService.display_style,
        checkbox_options: checkbox_options || existingService.checkbox_options,
        is_active: is_active !== undefined ? is_active : existingService.is_active,
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      service,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const deleteService = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id)

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const toggleServiceStatus = async (req, res) => {
  try {
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('is_active')
      .eq('id', req.params.id)
      .limit(1)
      .single()

    if (fetchError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    const { data: updatedService, error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      service: updatedService,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// DEBUG ENDPOINT - Get all services with status
export const debugAllServices = async (req, res) => {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('id, title, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      total: services?.length || 0,
      services,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ACTIVATE ALL SERVICES - for emergency fix
export const activateAllServices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .update({ is_active: true })
      .neq('id', null)
      .select('id, title, is_active')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      message: `Activated ${data?.length || 0} services`,
      services: data,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
