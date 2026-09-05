import rateLimit from 'express-rate-limit'

// Strict rate limit for authentication endpoints (login, register, admin login)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
})

// Rate limit for public kiosk uploads & job creation to prevent DoS / storage abuse
export const kioskUploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many upload requests. Please slow down and try again.',
  },
})

// Global API rate limit
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip static assets or health check
    return req.path === '/api/health' || req.path.startsWith('/uploads')
  },
  message: {
    success: false,
    message: 'Too many requests across API. Please wait a moment.',
  },
})
