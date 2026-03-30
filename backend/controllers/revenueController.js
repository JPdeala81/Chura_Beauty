import { supabase } from '../config/supabase.js'

export const getStats = async (req, res) => {
  try {
    // Get current month
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id')
      .eq('is_active', true)

    if (servicesError) {
      console.error('Services error:', servicesError)
    }

    // Get appointments this month
    const { data: appointmentsThisMonth, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status, revenue')
      .gte('desired_date', `${currentMonth}-01`)
      .lte('desired_date', `${currentMonth}-31`)

    if (appointmentsError) {
      console.error('Appointments error:', appointmentsError)
    }

    // Count pending appointments
    const pendingCount = (appointmentsThisMonth || [])
      .filter(a => a.status === 'pending').length

    // Calculate revenue
    const totalRevenue = (appointmentsThisMonth || [])
      .filter(a => a.status === 'accepted')
      .reduce((sum, a) => sum + (a.revenue || 0), 0)

    const stats = {
      services: services?.length || 0,
      appointments: appointmentsThisMonth?.length || 0,
      pending: pendingCount,
      revenue: totalRevenue
    }

    console.log('✅ Dashboard stats:', stats)
    res.status(200).json(stats)
  } catch (error) {
    console.error('❌ Error getting stats:', error)
    res.status(500).json({
      success: false,
      message: error.message,
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
