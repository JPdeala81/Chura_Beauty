import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import { sendWhatsAppMessage } from '../utils/whatsappUtil.js';
import { getAvailableSlots } from '../utils/slotUtil.js';

export const createAppointment = async (req, res) => {
  try {
    const {
      serviceId,
      clientName,
      clientPhone,
      clientWhatsapp,
      desiredDate,
      desiredTimeSlot,
      selectedOptions,
      customDescription,
    } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const appointment = await Appointment.create({
      serviceId,
      clientName,
      clientPhone,
      clientWhatsapp,
      desiredDate: new Date(desiredDate),
      desiredTimeSlot,
      selectedOptions,
      customDescription,
      status: 'pending',
    });

    const notification = await Notification.create({
      appointmentId: appointment._id,
      message: `Nouvelle demande de rendez-vous de ${clientName} pour ${service.title}`,
      type: 'new_request',
    });

    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const { status, serviceId, startDate, endDate } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (serviceId) {
      filter.serviceId = serviceId;
    }

    if (startDate || endDate) {
      filter.desiredDate = {};
      if (startDate) filter.desiredDate.$gte = new Date(startDate);
      if (endDate) filter.desiredDate.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(filter)
      .populate('serviceId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      'serviceId'
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId).populate('serviceId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    appointment.status = status;
    appointment.adminNotes = adminNotes || appointment.adminNotes;

    if (status === 'accepted') {
      appointment.revenue = appointment.serviceId.price;
    }

    await appointment.save();

    await Notification.create({
      appointmentId: appointment._id,
      message: `Rendez-vous ${status === 'accepted' ? 'accepté' : 'refusé'}`,
      type: status === 'accepted' ? 'accepted' : 'refused',
    });

    const message = generateAppointmentMessage(
      appointment,
      status === 'accepted'
    );

    await sendWhatsAppMessage(appointment.clientWhatsapp, message);

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateAppointmentMessage = (appointment, isAccepted) => {
  if (isAccepted) {
    return `Bonjour ${appointment.clientName} 👋\nVotre rendez-vous pour ${appointment.serviceId.title} a été confirmé ✅\n📅 Date : ${new Date(appointment.desiredDate).toLocaleDateString('fr-FR')}\n⏰ Heure : ${appointment.desiredTimeSlot.start} - ${appointment.desiredTimeSlot.end}\n📍 Lieu : [Adresse salon]\n📞 Contact : [Téléphone admin]\nÀ bientôt 💆‍♀️`;
  } else {
    return `Bonjour ${appointment.clientName},\nNous sommes désolés, votre demande de RDV pour ${appointment.serviceId.title}\nle ${new Date(appointment.desiredDate).toLocaleDateString('fr-FR')} à ${appointment.desiredTimeSlot.start} n'a pas pu être acceptée ❌.\nN'hésitez pas à choisir un autre créneau sur notre site.`;
  }
};

export const getAvailableAppointmentSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    const slots = await getAvailableSlots(serviceId, new Date(date));

    res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
