import { useState, useCallback } from 'react';

// Validators
const validators = {
  required: (value, message = 'Ce champ est requis') => {
    return value && value.toString().trim() !== '' ? '' : message;
  },

  email: (value) => {
    if (!value) return 'Email requis';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Email invalide';
  },

  minLength: (min) => (value, message = `Au minimum ${min} caractères`) => {
    return value && value.toString().length >= min ? '' : message;
  },

  maxLength: (max) => (value, message = `Maximum ${max} caractères`) => {
    return value && value.toString().length <= max ? '' : message;
  },

  minNumber: (min) => (value, message = `Doit être ≥ ${min}`) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min ? '' : message;
  },

  maxNumber: (max) => (value, message = `Doit être ≤ ${max}`) => {
    const num = parseFloat(value);
    return !isNaN(num) && num <= max ? '' : message;
  },

  match: (otherValue) => (value, message = 'Les valeurs ne correspondent pas') => {
    return value === otherValue ? '' : message;
  },

  password: (value) => {
    if (!value) return 'Mot de passe requis';
    if (value.length < 8) return 'Minimum 8 caractères';
    if (!/[A-Z]/.test(value)) return 'Au moins une majuscule';
    if (!/[a-z]/.test(value)) return 'Au moins une minuscule';
    if (!/[0-9]/.test(value)) return 'Au moins un chiffre';
    if (!/[!@#$%^&*]/.test(value)) return 'Au moins un caractère spécial (!@#$%^&*)';
    return '';
  },

  phone: (value) => {
    if (!value) return 'Téléphone requis';
    const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
    return phoneRegex.test(value.replace(/\s/g, '')) ? '' : 'Numéro invalide';
  },

  url: (value) => {
    if (!value) return 'URL requise';
    try {
      new URL(value);
      return '';
    } catch {
      return 'URL invalide';
    }
  },

  number: (value, message = 'Doit être un nombre') => {
    return !isNaN(parseFloat(value)) && isFinite(value) ? '' : message;
  },

  positiveNumber: (value, message = 'Doit être positif') => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 ? '' : message;
  }
};

export const useFormValidation = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName, value) => {
    const rules = validationRules[fieldName];
    if (!rules) return '';

    const rulesArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of rulesArray) {
      const error = typeof rule === 'function' ? rule(value) : '';
      if (error) return error;
    }

    return '';
  }, [validationRules]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation if field was touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      e.preventDefault();

      if (!validateAll()) {
        setTouched(Object.keys(validationRules).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}));
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [validateAll, validationRules, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const getFieldMeta = useCallback((fieldName) => {
    return {
      value: values[fieldName] || '',
      error: errors[fieldName],
      isTouched: touched[fieldName],
      isInvalid: touched[fieldName] && !!errors[fieldName]
    };
  }, [values, errors, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateField,
    validateAll,
    getFieldMeta,
    validators
  };
};

export default useFormValidation;
