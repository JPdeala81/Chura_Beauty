import api from './api';

export const createAppointment = (data) => {
  return api.post('/appointments', data);
};

export const getAppointments = (params = {}) => {
  return api.get('/appointments', { params });
};

export const getAppointmentById = (id) => {
  return api.get(`/appointments/${id}`);
};

export const updateAppointmentStatus = (id, status, adminNotes = '') => {
  return api.patch(`/appointments/${id}/status`, { status, adminNotes });
};

export const deleteAppointment = (id) => {
  return api.delete(`/appointments/${id}`);
};

export const getAvailableSlots = (serviceId, date) => {
  return api.get('/appointments/slots', {
    params: { serviceId, date },
  });
};
