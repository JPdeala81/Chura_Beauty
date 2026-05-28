// Standardize API responses across all dashboards
// Handles different response formats from various endpoints

export const extractData = (response, dataKey = null) => {
  if (!response) return null;

  const data = response.data || response;

  // If no specific key requested, try to auto-detect
  if (!dataKey) {
    // Check for common data structures
    if (Array.isArray(data)) return data;
    if (data.data !== undefined) return data.data;
    if (data.items !== undefined) return data.items;
    if (data.list !== undefined) return data.list;
    return data;
  }

  // Return specific key
  return data[dataKey] || null;
};

export const extractAppointments = (response) => {
  const data = response?.data || response || {};
  return Array.isArray(data.appointments)
    ? data.appointments
    : Array.isArray(data)
      ? data
      : [];
};

export const extractServices = (response) => {
  const data = response?.data || response || {};
  return Array.isArray(data.services)
    ? data.services
    : Array.isArray(data)
      ? data
      : [];
};

export const extractStats = (response) => {
  return response?.data || response || {};
};

export const extractSettings = (response) => {
  return response?.data || response || {};
};

export const extractProfile = (response) => {
  const data = response?.data || response || {};
  return data.admin || data || {};
};

export const extractPayments = (response) => {
  const data = response?.data || response || {};
  return Array.isArray(data.sessions)
    ? data.sessions
    : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];
};

// Handle errors consistently
export const handleApiError = (error) => {
  console.error('API Error:', error);

  const message = error?.response?.data?.message
    || error?.message
    || 'Une erreur est survenue';

  const status = error?.response?.status || 500;

  return {
    message,
    status,
    isNetworkError: !error?.response,
    data: error?.response?.data
  };
};

export default {
  extractData,
  extractAppointments,
  extractServices,
  extractStats,
  extractSettings,
  extractProfile,
  extractPayments,
  handleApiError
};
