import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';

export const getAvailableSlots = async (serviceId, date) => {
  try {
    const service = await Service.findById(serviceId);

    if (!service) {
      return [];
    }

    const dayOfWeek = getDayOfWeekName(date);
    const dateStr = date.toISOString().split('T')[0];

    let availableSlots = [];

    const dayAvailability = service.availability.find(
      (av) => av.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()
    );

    const specificAvailability = service.specificDates.find(
      (sd) => sd.date.toISOString().split('T')[0] === dateStr
    );

    const availability = specificAvailability || dayAvailability;

    if (!availability) {
      return [];
    }

    availableSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      service.duration
    );

    const bookedAppointments = await Appointment.find({
      serviceId,
      desiredDate: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        ),
      },
      status: 'accepted',
    });

    const bookedSlots = bookedAppointments.map(
      (appt) => appt.desiredTimeSlot.start
    );

    availableSlots = availableSlots.filter(
      (slot) => !bookedSlots.includes(slot.start)
    );

    return availableSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
};

const getDayOfWeekName = (date) => {
  const days = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];
  return days[date.getDay()];
};

const generateSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  const endTotalMinutes = endHour * 60 + endMinute;

  while (currentHour * 60 + currentMinute < endTotalMinutes) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    currentMinute += duration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }

    const slotEnd = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    if (currentHour * 60 + currentMinute <= endTotalMinutes) {
      slots.push({ start: slotStart, end: slotEnd, duration });
    }
  }

  return slots;
};
