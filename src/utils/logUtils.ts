/**
 * Utility functions for logging that prevent sensitive information from being exposed
 */

// List of patterns to redact from logs
const SENSITIVE_PATTERNS = [
  { pattern: /(api[_-]?key|apikey|key)["'\s:=]+["']?([a-zA-Z0-9_]{20,})["']?/gi, replacement: '$1: "REDACTED"' },
  { pattern: /(password|passwd|pwd)["'\s:=]+["']?([^"'\s]{3,})["']?/gi, replacement: '$1: "REDACTED"' },
  { pattern: /(secret|token)["'\s:=]+["']?([a-zA-Z0-9_]{10,})["']?/gi, replacement: '$1: "REDACTED"' },
  { pattern: /((clerk|supabase)[_-]?(secret|key))["'\s:=]+["']?([a-zA-Z0-9_]{10,})["']?/gi, replacement: '$1: "REDACTED"' },
  { pattern: /(bearer\s+)([a-zA-Z0-9_]{10,})/gi, replacement: '$1REDACTED' },
  { pattern: /([a-zA-Z0-9_]+@[a-zA-Z0-9_]+\.[a-zA-Z]{2,})/gi, replacement: 'REDACTED_EMAIL' },
];

/**
 * Sanitizes a message to remove sensitive information before logging
 * @param message The message to sanitize
 * @returns The sanitized message
 */
export const sanitizeLog = (message: unknown): unknown => {
  if (typeof message === 'string') {
    let sanitized = message;
    SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
      sanitized = sanitized.replace(pattern, replacement);
    });
    return sanitized;
  } else if (typeof message === 'object' && message !== null) {
    try {
      // Convert to string and back to sanitize
      const stringified = JSON.stringify(message);
      let sanitized = stringified;
      
      SENSITIVE_PATTERNS.forEach(({ pattern, replacement }) => {
        sanitized = sanitized.replace(pattern, replacement);
      });
      
      return JSON.parse(sanitized);
    } catch (e) {
      // If we can't stringify/parse, return a safe version
      return "[Object with potentially sensitive data]";
    }
  }
  
  return message;
};

/**
 * Safe console logging functions that sanitize sensitive information
 */
export const safeLog = {
  log: (...args: unknown[]) => {
    console.log(...args.map(sanitizeLog));
  },
  
  error: (...args: unknown[]) => {
    console.error(...args.map(sanitizeLog));
  },
  
  warn: (...args: unknown[]) => {
    console.warn(...args.map(sanitizeLog));
  },
  
  info: (...args: unknown[]) => {
    console.info(...args.map(sanitizeLog));
  },
  
  debug: (...args: unknown[]) => {
    console.debug(...args.map(sanitizeLog));
  }
};

// For development only - disable in production
export const enableVerboseLogging = (enable = true) => {
  if (!enable) {
    // Replace console methods with empty functions in production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.debug = () => {};
      // Keep error and warn for critical issues
    }
  }
}; 