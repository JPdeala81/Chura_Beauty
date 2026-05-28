// Data sanitization utility to prevent injection attacks and clean malicious data

// Dangerous patterns that indicate injection attempts
const DANGEROUS_PATTERNS = [
  /Get-ChildItem/gi,
  /powershell/gi,
  /cmd\.exe/gi,
  /bash/gi,
  /<script/gi,
  /javascript:/gi,
  /on\w+=/gi, // event handlers (onclick, onload, etc)
  /eval\(/gi,
  /expression\(/gi,
  /import\(/gi,
  /require\(/gi,
  /\.\.\/\.\.\//g, // path traversal
];

// Sanitize a single string
export const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;

  let sanitized = value;

  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      console.warn(`⚠️ Injection pattern détecté et supprimé: ${pattern}`);
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // HTML escape
  const div = document.createElement('div');
  div.textContent = sanitized;
  sanitized = div.innerHTML;

  // Remove extra whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

// Sanitize object
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return sanitizeString(obj);
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : sanitizeObject(item)
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !DANGEROUS_PATTERNS.some(p => p.test(email));
};

// Validate phone
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) && !DANGEROUS_PATTERNS.some(p => p.test(phone));
};

// Validate URL
export const isValidURL = (url) => {
  try {
    new URL(url);
    return !DANGEROUS_PATTERNS.some(p => p.test(url));
  } catch {
    return false;
  }
};

// Validate hex color
export const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// Safe JSON parse with sanitization
export const safeJSONParse = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeObject(parsed);
  } catch (err) {
    console.error('Erreur JSON parse:', err);
    return null;
  }
};

// Report suspicious data
export const reportSuspiciousData = (fieldName, value) => {
  console.error(`🚨 DONNÉES SUSPECTES: ${fieldName}`, {
    value,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
};

export default {
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidHexColor,
  safeJSONParse,
  reportSuspiciousData
};
