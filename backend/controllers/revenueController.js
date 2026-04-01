import { supabase } from '../config/supabase.js'

export const debugStats = async (req, res) => {
  try {
    console.log('🔍 DEBUG: Fetching all appointments to debug stats...')
    
    // Get ALL appointments with all fields
    const { data: allAppointments, error } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching debug data:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('🔍 DEBUG: Sample appointments:')
    allAppointments.forEach((apt, i) => {
      console.log(`   [${i}] ID: ${apt.id}, Status: ${apt.status}, DesiredDate: ${apt.desired_date}, Created: ${apt.created_at}`)
    })

    // Also check services
    const { data: services } = await supabase
      .from('services')
      .select('id, active')
      .eq('active', true)

    console.log(`🔍 DEBUG: Active services: ${services?.length || 0}`)

    res.json({
      totalAppointments: allAppointments.length,
      sampleAppointments: allAppointments.slice(0, 5),
      activeServices: services?.length || 0
    })
  } catch (error) {
    console.error('❌ Debug error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getStats = async (req, res) => {
  try {
    console.log('📊 Getting dashboard stats...')

    // Get all active services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('active', true)

    if (servicesError) {
      console.error('❌ Services error:', servicesError)
    }
    const activeServices = services?.length || 0
    console.log(`✅ Active services: ${activeServices}`)

    // Get ALL appointments (simple query without revenue)
    const { data: allAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status')
      .order('created_at', { ascending: false })

    if (appointmentsError) {
      console.error('❌ Appointments error:', appointmentsError)
      // Return defaults if appointments fails
      return res.status(200).json({
        services: activeServices,
        appointments: 0,
        pending: 0,
        revenue: 0
      })
    }

    console.log(`✅ Total appointments in DB: ${allAppointments?.length || 0}`)
    
    // Count appointments by status
    const totalAppointments = allAppointments?.length || 0
    const pendingCount = allAppointments?.filter(a => a.status === 'pending').length || 0
    const acceptedCount = allAppointments?.filter(a => a.status === 'accepted').length || 0

    // Simple revenue: assume average price of 50€ per accepted appointment
    const totalRevenue = acceptedCount * 50

    const stats = {
      services: activeServices,
      appointments: totalAppointments,
      pending: pendingCount,
      revenue: totalRevenue
    }

    console.log('✅ Final dashboard stats:', stats)
    res.status(200).json(stats)
  } catch (error) {
    console.error('❌ Error getting stats:', error)
    res.status(200).json({
      services: 0,
      appointments: 0,
      pending: 0,
      revenue: 0
    })
  }
}

export const getRevenue = async (req, res) => {
  try {
    const { period } = req.query

    // Récupérer tous les rendez-vous acceptés
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, services!inner(category)')
      .eq('status', 'accepted')

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    // Traiter les données côté serveur
    const revenueData = {}
    const categoryData = {}
    let totalRevenue = 0
    let totalAppointments = 0

    appointments.forEach((appointment) => {
      // Calculer par période
      const date = new Date(appointment.desired_date)
      let key
      if (period === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      } else if (period === 'year') {
        key = `${date.getFullYear()}`
      } else {
        // week est par défaut
        const week = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
        key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`
      }

      revenueData[key] = (revenueData[key] || 0) + (appointment.revenue || 0)

      // Calculer par catégorie
      const category = appointment.services?.category || 'Uncategorized'
      categoryData[category] = (categoryData[category] || 0) + (appointment.revenue || 0)

      totalRevenue += appointment.revenue || 0
      totalAppointments += 1
    })

    // Formater les données pour le graphique
    const formattedRevenueData = Object.entries(revenueData)
      .map(([period, total]) => ({
        _id: period,
        total,
      }))
      .sort((a, b) => a._id.localeCompare(b._id))

    const formattedCategoryData = Object.entries(categoryData)
      .map(([category, total]) => ({
        _id: category,
        total,
      }))
      .sort((a, b) => b.total - a.total)

    const stats = {
      totalRevenue,
      totalAppointments,
      averageRevenue: totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
    }

    res.status(200).json({
      success: true,
      revenueData: formattedRevenueData,
      categoryData: formattedCategoryData,
      stats,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
