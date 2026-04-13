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

    console.log('📝 Creating appointment:', {
      client_name,
      client_email,
      desired_date,
      slot_start,
      slot_end,
      status_will_be: 'pending'
    })

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

    // Préparer les données d'insertion
    const appointmentData = {
      service_id,
      client_name,
      client_phone,
      client_whatsapp,
      desired_date,
      slot_start,
      slot_end,
      selected_options: selected_options || [],
      custom_description,
      status: 'pending',
      revenue: 0,
    }

    // Essayer d'ajouter client_email si la colonne existe
    // sinon elle sera ignorée par Supabase
    if (client_email) {
      appointmentData.client_email = client_email
    }

    // Créer le rendez-vous - avec retry logic pour les colonnes manquantes
    let appointmentFinal = null
    let lastError = null

    // Stratégie: essayer avec tous les champs, puis progressivement en retirer
    const fieldsToTry = [
      {
        name: 'Tous les champs',
        data: appointmentData
      },
      {
        name: 'Sans client_email',
        data: { ...appointmentData, client_email: undefined }
      },
      {
        name: 'Sans client_name',
        data: { ...appointmentData, client_name: undefined }
      },
      {
        name: 'Sans client_phone',
        data: { ...appointmentData, client_phone: undefined }
      },
      {
        name: 'Sans client_whatsapp',
        data: { ...appointmentData, client_whatsapp: undefined }
      },
      {
        name: 'Champs minimaux',
        data: {
          service_id,
          desired_date,
          slot_start,
          slot_end,
          selected_options: selected_options || [],
          custom_description,
          status: 'pending',
          revenue: 0,
        }
      }
    ]

    for (const attempt of fieldsToTry) {
      // Nettoyer les champs undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(attempt.data).filter(([_, v]) => v !== undefined && v !== null)
      )

      console.log(`⏳ Tentative: ${attempt.name}`)

      const { data: result, error: err } = await supabase
        .from('appointments')
        .insert([cleanData])
        .select()

      if (!err && result) {
        appointmentFinal = result && result.length > 0 ? result[0] : result
        console.log(`✅ Rendez-vous créé avec succès: ${attempt.name}`)
        break
      }

      lastError = err
      console.log(`⚠️ Erreur avec "${attempt.name}": ${err?.message}`)
    }

    if (!appointmentFinal) {
      console.error('❌ Impossible de créer le rendez-vous après toutes les tentatives:', lastError)
      return res.status(500).json({
        success: false,
        message: lastError?.message || 'Impossible de créer le rendez-vous',
      })
    }

    console.log('✅ Appointment created:', {
      id: appointmentFinal?.id,
      desired_date: appointmentFinal?.desired_date,
      status: appointmentFinal?.status
    })

    // Créer une notification
    await supabase
      .from('notifications')
      .insert({
        appointment_id: appointmentFinal.id,
        message: `Nouvelle demande de rendez-vous de ${client_name} pour ${service.title}`,
        type: 'new_request',
      })

    // Récupérer le numéro WhatsApp du super admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('whatsapp')
      .limit(1)
      .single()

    // Envoyer un message WhatsApp au super admin
    if (admin && admin.whatsapp && !adminError) {
      const adminMessage = generateNewAppointmentNotification({
        client_name,
        clientWhatsapp: client_whatsapp,
        service: service,
        desired_date: desired_date,
        slot_start,
        slot_end,
        custom_description,
      })
      try {
        await sendWhatsAppMessage(admin.whatsapp, adminMessage)
        console.log('✅ WhatsApp notification sent to admin')
      } catch (whatsappError) {
        console.error('⚠️ Failed to send WhatsApp notification to admin:', whatsappError.message)
      }
    }

    res.status(201).json({
      success: true,
      appointment: appointmentFinal,
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
    console.log('📋 getAppointments called with query:', req.query)
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

    console.log('📋 Supabase query result - Appointments:', appointments)
    console.log('📋 Supabase query result - Error:', error)

    if (error) {
      console.error('❌ Supabase error:', error)
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }

    console.log('✅ Returning appointments:', appointments)
    res.status(200).json({
      success: true,
      appointments,
    })
  } catch (error) {
    console.error('❌ Controller error:', error)
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

const generateNewAppointmentNotification = (appointment) => {
  return `
🔔 NOUVELLE DEMANDE DE RENDEZ-VOUS 🔔
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 *Client* : ${appointment.client_name}
📱 *WhatsApp* : ${appointment.clientWhatsapp}
💅 *Service* : ${appointment.service.title}
💰 *Prix* : ${appointment.service.price} FCFA

📅 *Date Demandée* : ${new Date(appointment.desired_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ *Heure* : ${appointment.slot_start} - ${appointment.slot_end}

${appointment.custom_description ? `📝 *Notes du client* :\n${appointment.custom_description}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ À accepter ou refuser dans votre dashboard
`
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
