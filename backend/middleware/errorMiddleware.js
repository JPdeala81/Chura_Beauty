// Standardized error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Handle specific HTTP status codes with custom messages
  const responseMap = {
    400: { message: 'Invalid request' },
    401: { message: 'Unauthorized - please login' },
    403: { message: 'Forbidden - access denied' },
    404: { message: 'Resource not found' },
    409: { message: 'Conflict - resource already exists' },
    413: { message: 'Request entity too large - file size exceeds limit (max 5MB)' },
  };

  const customMessage = responseMap[status]?.message || message;

  res.status(status).json({
    success: false,
    message: customMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async error wrapper - catches promise rejections
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class for consistency
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

export default errorHandler;
