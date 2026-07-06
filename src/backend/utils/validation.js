// Input validation utilities
import { ValidationError } from './error-types.js';

/**
 * Validation rules and helpers
 */
export class Validator {
  constructor() {
    this.errors = [];
  }

  /**
   * Add an error to the validation results
   */
  addError(field, message, value = null) {
    this.errors.push({
      field,
      message,
      value: value ? String(value).substring(0, 100) : null
    });
  }

  /**
   * Check if validation has errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Get all validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Throw validation error if there are any errors
   */
  throwIfErrors() {
    if (this.hasErrors()) {
      const errorMessage = this.errors.map(err => `${err.field}: ${err.message}`).join(', ');
      throw new ValidationError(errorMessage, this.errors[0].field, this.errors[0].value);
    }
  }

  /**
   * Reset validation errors
   */
  reset() {
    this.errors = [];
  }
}

/**
 * Validation rule functions
 */
export const Rules = {
  /**
   * Check if value is required (not null, undefined, or empty string)
   */
  required(value, field) {
    if (value === null || value === undefined || value === '') {
      return `${field} is required`;
    }
    return null;
  },

  /**
   * Check if string meets minimum length
   */
  minLength(value, minLen, field) {
    if (typeof value === 'string' && value.length < minLen) {
      return `${field} must be at least ${minLen} characters long`;
    }
    return null;
  },

  /**
   * Check if string doesn't exceed maximum length
   */
  maxLength(value, maxLen, field) {
    if (typeof value === 'string' && value.length > maxLen) {
      return `${field} must not exceed ${maxLen} characters`;
    }
    return null;
  },

  /**
   * Check if value matches email pattern
   */
  email(value, field) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof value === 'string' && !emailRegex.test(value)) {
      return `${field} must be a valid email address`;
    }
    return null;
  },

  /**
   * Check if value is a valid URL
   */
  url(value, field) {
    try {
      new URL(value);
      return null;
    } catch {
      return `${field} must be a valid URL`;
    }
  },

  /**
   * Check if value is a number
   */
  numeric(value, field) {
    if (isNaN(Number(value))) {
      return `${field} must be a number`;
    }
    return null;
  },

  /**
   * Check if number is within range
   */
  range(value, min, max, field) {
    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return `${field} must be between ${min} and ${max}`;
    }
    return null;
  },

  /**
   * Check if value matches regex pattern
   */
  pattern(value, regex, field, message = null) {
    if (typeof value === 'string' && !regex.test(value)) {
      return message || `${field} format is invalid`;
    }
    return null;
  },

  /**
   * Check if value is one of allowed values
   */
  oneOf(value, allowedValues, field) {
    if (!allowedValues.includes(value)) {
      return `${field} must be one of: ${allowedValues.join(', ')}`;
    }
    return null;
  },

  /**
   * Check if value is a valid UUID
   */
  uuid(value, field) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value === 'string' && !uuidRegex.test(value)) {
      return `${field} must be a valid UUID`;
    }
    return null;
  },

  /**
   * Check if value is a valid payment ID
   */
  paymentId(value, field) {
    const paymentIdRegex = /^pay_[a-zA-Z0-9]{16}$/;
    if (typeof value === 'string' && !paymentIdRegex.test(value)) {
      return `${field} must be a valid payment ID`;
    }
    return null;
  },

  /**
   * Check if value is a valid message ID
   */
  messageId(value, field) {
    const messageIdRegex = /^msg_[a-zA-Z0-9_]+$/;
    if (typeof value === 'string' && !messageIdRegex.test(value)) {
      return `${field} must be a valid message ID`;
    }
    return null;
  },

  /**
   * Check if value is safe (no script tags or dangerous content)
   */
  safe(value, field) {
    if (typeof value === 'string') {
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return `${field} contains potentially unsafe content`;
        }
      }
    }
    return null;
  }
};

/**
 * Schema-based validation
 */
export function validateSchema(data, schema) {
  const validator = new Validator();

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    for (const rule of rules) {
      let error = null;

      if (typeof rule === 'function') {
        error = rule(value, field);
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule;
        const ruleFunction = Rules[type];
        
        if (ruleFunction) {
          error = ruleFunction(value, ...Object.values(params), field);
        }
      }

      if (error) {
        validator.addError(field, error, value);
        break; // Stop at first error for this field
      }
    }
  }

  validator.throwIfErrors();
  return true;
}

/**
 * Express middleware for request validation
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      // Validate body
      if (schema.body) {
        validateSchema(req.body || {}, schema.body);
      }

      // Validate query parameters
      if (schema.query) {
        validateSchema(req.query || {}, schema.query);
      }

      // Validate route parameters
      if (schema.params) {
        validateSchema(req.params || {}, schema.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Sanitization functions
 */
export const Sanitizers = {
  /**
   * Remove HTML tags from string
   */
  stripHtml(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '');
  },

  /**
   * Escape HTML entities
   */
  escapeHtml(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },

  /**
   * Trim whitespace
   */
  trim(value) {
    if (typeof value !== 'string') return value;
    return value.trim();
  },

  /**
   * Normalize to lowercase
   */
  toLowerCase(value) {
    if (typeof value !== 'string') return value;
    return value.toLowerCase();
  },

  /**
   * Remove non-alphanumeric characters (except spaces)
   */
  alphanumeric(value) {
    if (typeof value !== 'string') return value;
    return value.replace(/[^a-zA-Z0-9\s]/g, '');
  },

  /**
   * Limit string length
   */
  truncate(value, maxLength = 255) {
    if (typeof value !== 'string') return value;
    return value.length > maxLength ? value.substring(0, maxLength) : value;
  }
};

/**
 * Apply sanitization to request data
 */
export function sanitizeRequest(sanitizers) {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (sanitizers.body && req.body) {
        for (const [field, sanitizerList] of Object.entries(sanitizers.body)) {
          if (req.body[field] !== undefined) {
            for (const sanitizer of sanitizerList) {
              if (typeof sanitizer === 'function') {
                req.body[field] = sanitizer(req.body[field]);
              } else if (typeof sanitizer === 'string' && Sanitizers[sanitizer]) {
                req.body[field] = Sanitizers[sanitizer](req.body[field]);
              }
            }
          }
        }
      }

      // Sanitize query parameters
      if (sanitizers.query && req.query) {
        for (const [field, sanitizerList] of Object.entries(sanitizers.query)) {
          if (req.query[field] !== undefined) {
            for (const sanitizer of sanitizerList) {
              if (typeof sanitizer === 'function') {
                req.query[field] = sanitizer(req.query[field]);
              } else if (typeof sanitizer === 'string' && Sanitizers[sanitizer]) {
                req.query[field] = Sanitizers[sanitizer](req.query[field]);
              }
            }
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  chatMessage: {
    message: [
      Rules.required,
      (value, field) => Rules.minLength(value, 1, field),
      (value, field) => Rules.maxLength(value, 10000, field),
      Rules.safe
    ]
  },

  paymentVerification: {
    paymentId: [
      Rules.required,
      Rules.paymentId
    ],
    proof: [
      (value, field) => Rules.maxLength(value, 1000, field)
    ]
  },

  paymentStatus: {
    paymentId: [
      Rules.required,
      Rules.paymentId
    ]
  }
};