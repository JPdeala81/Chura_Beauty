import api from './api';

export const getAllServices = (params = {}) => {
  return api.get('/services', { params });
};

export const getServiceById = (id) => {
  return api.get(`/services/${id}`);
};

export const createService = (data) => {
  return api.post('/services', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateService = (id, data) => {
  return api.put(`/services/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteService = (id) => {
  return api.delete(`/services/${id}`);
};

export const toggleServiceStatus = (id) => {
  return api.patch(`/services/${id}/toggle`);
};
