import { supabase } from '../config/supabase.js'
import { sendWhatsAppMessage } from '../utils/whatsappUtil.js'
import { getAvailableSlots } from '../utils/slotUtil.js'

export const createAppointment = async (req, res) => {
  try {
    const {
      service_id,
      client_name,
      client_phone,
      client_email,
      client_whatsapp,
      desired_date,
      slot_start,
      slot_end,
      selected_options,
      custom_description,
    } = req.body

    // Vérifier que le service existe
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', service_id)
      .limit(1)
      .single()

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      })
    }

    // Créer le rendez-vous
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        service_id,
        client_name,
        client_phone,
        client_email,
        client_whatsapp,
        desired_date,
        slot_start,
        slot_end,
        selected_options: selected_options || [],
        custom_description,
        status: 'pending',
        revenue: 0,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    // Créer une notification
    await supabase
      .from('notifications')
      .insert({
        appointment_id: appointment.id,
        message: `Nouvelle demande de rendez-vous de ${client_name} pour ${service.title}`,
        type: 'new_request',
      })

    res.status(201).json({
      success: true,
      appointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getAppointments = async (req, res) => {
  try {
    const { status, service_id, start_date, end_date } = req.query

    let query = supabase
      .from('appointments')
      .select('*, services!inner(title, price)')

    if (status) {
      query = query.eq('status', status)
    }

    if (service_id) {
      query = query.eq('service_id', service_id)
    }

    if (start_date) {
      query = query.gte('desired_date', start_date)
    }

    if (end_date) {
      query = query.lte('desired_date', end_date)
    }

    const { data: appointments, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    res.status(200).json({
      success: true,
      appointments,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getAppointmentById = async (req, res) => {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*, services!inner(title, price)')
      .eq('id', req.params.id)
      .limit(1)
      .single()

    if (error || !appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    res.status(200).json({
      success: true,
      appointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body
    const appointmentId = req.params.id

    // Récupérer le rendez-vous et le service
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*, services!inner(title, price)')
      .eq('id', appointmentId)
      .limit(1)
      .single()

    if (fetchError || !appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      })
    }

    // Calculer la revenue si accepté
    const revenue = status === 'accepted' ? appointment.services.price : 0

    // Mettre à jour le status
    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update({
        status,
        admin_notes: admin_notes || null,
        revenue,
      })
      .eq('id', appointmentId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    // Créer une notification
    await supabase
      .from('notifications')
      .insert({
        appointment_id: appointmentId,
        message: `Rendez-vous ${status === 'accepted' ? 'accepté' : 'refusé'}`,
        type: status === 'accepted' ? 'accepted' : 'refused',
      })

    // Envoyer message WhatsApp
    const message = generateAppointmentMessage(appointment, status === 'accepted')
    if (appointment.client_whatsapp) {
      await sendWhatsAppMessage(appointment.client_whatsapp, message)
    }

    res.status(200).json({
      success: true,
      appointment: updatedAppointment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const deleteAppointment = async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
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
      message: 'Appointment deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const generateAppointmentMessage = (appointment, isAccepted) => {
  if (isAccepted) {
    return `🎉 Bonjour ${appointment.client_name}!\n\nVotre rendez-vous pour *${appointment.services.title}* a été ✅ *CONFIRMÉ*!\n\n📅 *Date* : ${new Date(appointment.desired_date).toLocaleDateString('fr-FR')}\n⏰ *Heure* : ${appointment.slot_start} - ${appointment.slot_end}\n💰 *Prix* : ${appointment.services.price} FCFA\n\nMerci de confirmer votre présence. À très bientôt! 💆‍♀️✨`
  } else {
    return `Bonjour ${appointment.client_name},\n\nNous sommes désolés, votre demande de RDV pour *${appointment.services.title}* n'a pas pu être acceptée pour le ${new Date(appointment.desired_date).toLocaleDateString('fr-FR')} à ${appointment.slot_start}.\n\nN'hésitez pas à visiter notre site pour choisir un autre créneau. Merci de votre compréhension!`
  }
}

export const getAvailableAppointmentSlots = async (req, res) => {
  try {
    const { service_id, date } = req.query

    const slots = await getAvailableSlots(service_id, new Date(date))

    res.status(200).json({
      success: true,
      slots,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
