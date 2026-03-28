import { supabase } from '../config/supabase.js';

export const getAvailableSlots = async (serviceId, date) => {
  try {
    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      console.error('Service not found:', serviceError);
      return [];
    }

    const dayOfWeek = getDayOfWeekName(date);
    const dateStr = date.toISOString().split('T')[0];

    let availableSlots = [];

    // Get availability for this service and date
    const { data: availabilities, error: availError } = await supabase
      .from('availabilities')
      .select('*')
      .eq('service_id', serviceId)
      .or(`day_of_week.eq.${dayOfWeek},specific_date.eq.${dateStr}`);

    const availability = availabilities?.[0];

    if (availError || !availability) {
      console.error('Availability not found:', availError);
      return [];
    }

    availableSlots = generateSlots(
      availability.start_time,
      availability.end_time,
      service.duration
    );

    // Get booked appointments for this date
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const startISOStr = dayStart.toISOString();
    const endISOStr = dayEnd.toISOString();

    const { data: bookedAppointments, error: appointError } = await supabase
      .from('appointments')
      .select('time_slot')
      .eq('service_id', serviceId)
      .eq('status', 'accepted')
      .gte('appointment_date', startISOStr)
      .lt('appointment_date', endISOStr);

    if (appointError) {
      console.error('Error fetching booked appointments:', appointError);
    }

    const bookedSlots = (bookedAppointments || []).map((appt) => appt.time_slot);

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
