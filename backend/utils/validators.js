// Input validation utilities

export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string') return false;
    return emailRegex.test(email);
  },

  // Phone validation (supports international formats)
  phone: (phone) => {
    const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
    if (!phone || typeof phone !== 'string') return false;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // String length validation
  stringLength: (str, min = 1, max = 500) => {
    if (typeof str !== 'string') return false;
    const len = str.trim().length;
    return len >= min && len <= max;
  },

  // Number validation
  number: (num, min = 0, max = Infinity) => {
    const n = parseFloat(num);
    return !isNaN(n) && n >= min && n <= max;
  },

  // Positive number
  positiveNumber: (num) => {
    return validators.number(num, 0.01, Infinity);
  },

  // Integer validation
  integer: (num, min = -Infinity, max = Infinity) => {
    const n = parseInt(num);
    return !isNaN(n) && n >= min && n <= max && Number.isInteger(n);
  },

  // File size validation (in bytes)
  fileSize: (bytes, maxMB = 5) => {
    const maxBytes = maxMB * 1024 * 1024;
    return bytes <= maxBytes;
  },

  // File type validation
  fileType: (mimeType, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return allowedTypes.includes(mimeType);
  },

  // Required field validation
  required: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  },

  // Array validation
  array: (arr, minLength = 0, maxLength = Infinity) => {
    if (!Array.isArray(arr)) return false;
    return arr.length >= minLength && arr.length <= maxLength;
  },

  // UUID validation
  uuid: (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },

  // Slug validation (for URLs)
  slug: (str) => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(str);
  },

  // Color hex validation
  hexColor: (color) => {
    const hexRegex = /^#(?:[0-9a-f]{3}){1,2}$/i;
    return hexRegex.test(color);
  },

  // Date validation (YYYY-MM-DD)
  date: (dateStr) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  // ISO datetime validation
  isoDateTime: (dateStr) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date) && dateStr === date.toISOString();
  },
};

// Validation error helper
export class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.status = 400;
    this.field = field;
    this.name = 'ValidationError';
  }
}

// Batch validation helper
export const validateFields = (data, rules) => {
  const errors = {};

  for (const [field, validator] of Object.entries(rules)) {
    const value = data[field];

    if (typeof validator === 'function') {
      if (!validator(value)) {
        errors[field] = `Invalid ${field}`;
      }
    } else if (Array.isArray(validator)) {
      // Multiple validation rules
      for (const rule of validator) {
        const result = rule(value);
        if (result !== true) {
          errors[field] = result;
          break;
        }
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Custom rule generators
export const createValidators = {
  // Create email validator with custom message
  email: (message = 'Invalid email address') => {
    return (value) => validators.email(value) ? true : message;
  },

  // Create phone validator with custom message
  phone: (message = 'Invalid phone number') => {
    return (value) => validators.phone(value) ? true : message;
  },

  // Create string length validator
  stringLength: (min, max, message = `Must be between ${min} and ${max} characters`) => {
    return (value) => validators.stringLength(value, min, max) ? true : message;
  },

  // Create required field validator
  required: (message = 'This field is required') => {
    return (value) => validators.required(value) ? true : message;
  },

  // Create number range validator
  numberRange: (min, max, message = `Must be between ${min} and ${max}`) => {
    return (value) => validators.number(value, min, max) ? true : message;
  },

  // Create file size validator
  fileSize: (maxMB, message = `File must be smaller than ${maxMB}MB`) => {
    return (bytes) => validators.fileSize(bytes, maxMB) ? true : message;
  },

  // Create file type validator
  fileType: (allowedTypes, message = `Invalid file type`) => {
    return (mimeType) => validators.fileType(mimeType, allowedTypes) ? true : message;
  },
};

export default validators;
