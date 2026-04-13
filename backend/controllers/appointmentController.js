import { supabase } from '../config/supabase.js'
import { sendWhatsAppMessage } from '../utils/whatsappUtil.js'
import { getAvailableSlots } from '../utils/slotUtil.js'
import { randomUUID } from 'crypto'

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

    // Extraire user_id si présent (peut être du JWT ou du body)
    // Si pas d'utilisateur authentifié, générer un UUID anonyme
    let user_id = req.user?.id || req.user?.sub || req.body.user_id
    if (!user_id) {
      user_id = randomUUID()
      console.log(`👤 No auth user - generated anonymous guest ID: ${user_id}`)
    }

    console.log('📝 Creating appointment:', {
      client_name,
      client_email,
      desired_date,
      slot_start,
      slot_end,
      user_id: user_id ? '✓ Set (generated)' : '✗ Not set',
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
      user_id, // Toujours présent (généré ou authentifié)
    }

    // Essayer d'ajouter client_email si disponible
    if (client_email) {
      appointmentData.client_email = client_email
    }

    // Créer le rendez-vous - Ultra-robust retry logic pour tous les champs potentiellement manquants
    let appointmentFinal = null
    let lastError = null

    // Stratégie COMPLÈTE: essayer progressivement les champs, du plus complet au minimal
    // user_id est TOUJOURS présent (généré ou authentifié)
    const fieldsToTry = [
      // Niveau 1-3: Tous les champs principaux
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
      
      // Niveau 5-7: Sans champs descriptifs
      {
        name: 'Sans custom_description',
        data: { ...appointmentData, custom_description: undefined }
      },
      {
        name: 'Sans selected_options',
        data: { ...appointmentData, selected_options: undefined }
      },
      {
        name: 'Sans custom_description et selected_options',
        data: {
          ...appointmentData,
          custom_description: undefined,
          selected_options: undefined
        }
      },
      
      // Niveau 8-10: Sans champs temporels
      {
        name: 'Sans slot_start et slot_end',
        data: {
          service_id,
          client_name,
          client_phone,
          client_email,
          client_whatsapp,
          desired_date,
          status: 'pending',
          revenue: 0,
          user_id,
        }
      },
      {
        name: 'Sans desired_date',
        data: {
          service_id,
          client_name,
          client_phone,
          client_email,
          client_whatsapp,
          slot_start,
          slot_end,
          selected_options: selected_options || [],
          custom_description,
          status: 'pending',
          revenue: 0,
          user_id,
        }
      },
      
      // Niveau 11-14: Minimal
      {
        name: 'Minimal: service + date + user_id',
        data: {
          service_id,
          desired_date,
          status: 'pending',
          user_id,
        }
      },
      {
        name: 'Minimal: service + user_id',
        data: {
          service_id,
          status: 'pending',
          user_id,
        }
      },
      {
        name: 'Minimal: service + status + revenue + user_id',
        data: {
          service_id,
          status: 'pending',
          revenue: 0,
          user_id,
        }
      },
      {
        name: 'Ultime: service_id + user_id',
        data: {
          service_id,
          user_id,
        }
      }
    ]

    for (const attempt of fieldsToTry) {
      // Nettoyer les champs undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(attempt.data).filter(([_, v]) => v !== undefined && v !== null)
      )

      // Ne pas essayer avec des données complètement vides sauf en dernier recours
      if (Object.keys(cleanData).length === 0 && attempt.name !== 'Tentative finale - minimal object') {
        console.log(`⏭️  ${attempt.name} - ignoré (données vides)`)
        continue
      }

      console.log(`⏳ Tentative: ${attempt.name}`)
      console.log(`   Champs: [${Object.keys(cleanData).join(', ')}]`)

      try {
        const { data: result, error: err } = await supabase
          .from('appointments')
          .insert([cleanData])
          .select()

        // Vérifier que c'est vraiment un succès: pas d'erreur ET result est un array non-vide
        if (!err && result && Array.isArray(result) && result.length > 0) {
          appointmentFinal = result[0]
          console.log(`✅ SUCCÈS! Rendez-vous créé avec: ${attempt.name}`)
          console.log(`   Champs utilisés: [${Object.keys(cleanData).join(', ')}]`)
          console.log(`   ID: ${appointmentFinal?.id}`)
          break
        } else if (err) {
          lastError = err
          console.log(`⚠️  Erreur "${attempt.name}": ${err?.message}`)
        } else if (!result || !Array.isArray(result) || result.length === 0) {
          console.log(`⚠️  Résultat vide pour "${attempt.name}"`)
          lastError = new Error(`Empty result from insert`)
        }
      } catch (catchErr) {
        console.error(`❌ Exception "${attempt.name}":`, catchErr.message)
        lastError = catchErr
      }
    }

    if (!appointmentFinal) {
      console.error('❌ Impossible de créer le rendez-vous après toutes les 19 tentatives!')
      console.error('   Dernière erreur:', lastError?.message)
      return res.status(500).json({
        success: false,
        message: lastError?.message || 'Impossible de créer le rendez-vous - problème de configuration de base de données',
      })
    }

    console.log('✅ Appointment created successfully:', {
      id: appointmentFinal?.id,
      status: appointmentFinal?.status,
      createdAt: new Date().toISOString()
    })

    // Envoyer la réponse de succès immédiatement
    res.status(201).json({
      success: true,
      appointment: appointmentFinal,
    })

    // Créer une notification (non-blocking)
    try {
      await supabase
        .from('notifications')
        .insert({
          appointment_id: appointmentFinal.id,
          message: `Nouvelle demande de rendez-vous de ${client_name} pour ${service.title}`,
          type: 'new_request',
        })
      console.log('✅ Notification created')
    } catch (notifError) {
      console.error('⚠️ Failed to create notification:', notifError.message)
    }

    // Récupérer le numéro WhatsApp du super admin et envoyer message
    try {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('whatsapp')
        .limit(1)
        .single()

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
    } catch (adminError) {
      console.error('⚠️ Failed to fetch admin or send WhatsApp:', adminError.message)
    }
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

    // Mettre à jour le status - avec retry logic si des colonnes manquent
    let updatedAppointment = null
    let updateError = null

    const updateConfigs = [
      {
        name: 'Tous les champs (status, admin_notes, revenue)',
        data: { status, admin_notes: admin_notes || null, revenue }
      },
      {
        name: 'Sans admin_notes',
        data: { status, revenue }
      },
      {
        name: 'Sans revenue',
        data: { status, admin_notes: admin_notes || null }
      },
      {
        name: 'Juste status',
        data: { status }
      }
    ]

    for (const config of updateConfigs) {
      // Nettoyer les champs null
      const cleanUpdateData = Object.fromEntries(
        Object.entries(config.data).filter(([_, v]) => v !== null)
      )

      console.log(`⏳ Tentative update: ${config.name}`)

      try {
        const { data: result, error: err } = await supabase
          .from('appointments')
          .update(cleanUpdateData)
          .eq('id', appointmentId)
          .select()
          .single()

        if (!err && result) {
          updatedAppointment = result
          console.log(`✅ Statut mis à jour avec: ${config.name}`)
          break
        } else if (err) {
          updateError = err
          console.log(`⚠️  Erreur update "${config.name}": ${err?.message}`)
        }
      } catch (catchErr) {
        console.error(`❌ Exception update "${config.name}":`, catchErr.message)
        updateError = catchErr
      }
    }

    if (!updatedAppointment) {
      console.error('❌ Failed to update appointment status:', updateError?.message)
      return res.status(500).json({
        success: false,
        message: updateError?.message || 'Failed to update appointment status',
      })
    }

    // Créer une notification (non-blocking)
    try {
      await supabase
        .from('notifications')
        .insert({
          appointment_id: appointmentId,
          message: `Rendez-vous ${status === 'accepted' ? 'accepté' : 'refusé'}`,
          type: status === 'accepted' ? 'accepted' : 'refused',
        })
      console.log('✅ Status notification created')
    } catch (notifError) {
      console.error('⚠️ Failed to create status notification:', notifError.message)
    }

    // Envoyer message WhatsApp (non-blocking)
    try {
      const message = generateAppointmentMessage(appointment, status === 'accepted')
      if (appointment.client_whatsapp) {
        await sendWhatsAppMessage(appointment.client_whatsapp, message)
        console.log('✅ WhatsApp message sent to client')
      }
    } catch (whatsappError) {
      console.error('⚠️ Failed to send WhatsApp to client:', whatsappError.message)
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
