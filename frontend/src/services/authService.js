import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getAdmin = (token) => {
  return api.get('/auth/admin', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateAdmin = (data, token) => {
  return api.put('/auth/admin', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updatePassword = (currentPassword, newPassword, token) => {
  return api.put(
    '/auth/admin/password',
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const updatePaymentConfig = (config, token) => {
  return api.put('/auth/admin/payment-config', config, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
