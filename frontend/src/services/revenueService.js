import api from './api';

export const getRevenue = (period = 'week') => {
  return api.get('/revenue', { params: { period } });
};
