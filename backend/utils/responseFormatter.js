// Standardized API response formatter

export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

export const errorResponse = (message, status = 500) => ({
  success: false,
  message,
  status
});

export default {
  successResponse,
  errorResponse
};
