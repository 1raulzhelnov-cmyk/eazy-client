// Security utilities for the application

/**
 * Sanitizes text content to prevent XSS attacks
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML tags and escape special characters
  return text
    .replace(/[<>]/g, '')
    .replace(/[&]/g, '&amp;')
    .replace(/['"]/g, (match) => match === '"' ? '&quot;' : '&#39;')
    .trim();
};

/**
 * Validates if a string contains only safe characters for IDs
 */
export const isValidId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Creates a rate limiter for actions
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();