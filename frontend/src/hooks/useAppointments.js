import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as appointmentService from '../services/appointmentService';

export const useAppointments = () => {
  const { token } = useContext(AuthContext);

  const getAppointments = async (filters = {}) => {
    return appointmentService.getAppointments(filters);
  };

  const getAppointmentById = async (id) => {
    return appointmentService.getAppointmentById(id);
  };

  const updateStatus = async (id, status, adminNotes) => {
    return appointmentService.updateAppointmentStatus(id, status, adminNotes);
  };

  const deleteAppointment = async (id) => {
    return appointmentService.deleteAppointment(id);
  };

  const getAvailableSlots = async (serviceId, date) => {
    return appointmentService.getAvailableSlots(serviceId, date);
  };

  return {
    getAppointments,
    getAppointmentById,
    updateStatus,
    deleteAppointment,
    getAvailableSlots,
  };
};
