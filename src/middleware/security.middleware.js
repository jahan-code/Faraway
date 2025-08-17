import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
// import slowDown from 'express-slow-down'; // Temporarily disabled
// import hpp from 'hpp'; // Temporarily disabled due to query property conflicts
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// ===== 1. HELMET - Security Headers =====
export const helmetConfig = helmet({
  // Basic security headers (fast and effective)
  contentSecurityPolicy: false, // Disable for now (can be complex)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
});

// ===== 2. RATE LIMITING - Smart Configuration =====
export const smartRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow 1000 requests per 15 minutes (very generous)
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  // Performance optimizations
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

// ===== 3. SLOW DOWN - For Brute Force Protection =====
// Temporarily disabled due to v2 compatibility issues
// export const smartSlowDown = slowDown({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   delayAfter: 100, // Allow 100 requests before slowing down
//   delayMs: () => 200, // Fixed for v2: use function instead of number
//   maxDelayMs: 10000, // Maximum delay of 10 seconds
//   // Performance optimizations
//   skipSuccessfulRequests: true, // Don't slow down successful requests
//   // Disable validation warnings
//   validate: { delayMs: false }
// });

// ===== 4. STRICT RATE LIMIT - For Login Routes =====
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    error: 'LOGIN_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// ===== 5. CUSTOM PARAMETER POLLUTION PROTECTION =====
// Safer alternative to HPP that doesn't modify query objects
export const customHppProtection = (req, res, next) => {
  try {
    // Skip OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    // Check for duplicate parameters in query string (basic HPP protection)
    const url = req.url;
    if (url.includes('?') && url.includes('&')) {
      const queryPart = url.split('?')[1];
      const params = queryPart.split('&');
      const paramNames = params.map(p => p.split('=')[0]);
      
      // Check for duplicate parameter names
      const duplicates = paramNames.filter((name, index) => paramNames.indexOf(name) !== index);
      
      if (duplicates.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate parameters detected. Please check your request.',
          error: 'PARAMETER_POLLUTION_DETECTED'
        });
      }
    }
    
    next();
  } catch (error) {
    // If there's any error, just continue (don't block the request)
    next();
  }
};

// ===== 6. MONGO SANITIZE - MongoDB Injection Protection =====
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: '_', // Replace dangerous characters with underscore
});

// ===== 7. XSS CLEAN - Cross-Site Scripting Protection =====
export const xssConfig = xss();

// ===== COMBINED SECURITY MIDDLEWARE =====
export const securityMiddleware = [
  helmetConfig,
  customHppProtection, // Custom safer alternative to HPP
  mongoSanitizeConfig,
  xssConfig,
  smartRateLimit,
  // smartSlowDown, // Temporarily disabled
];

// ===== LOGIN-SPECIFIC SECURITY =====
export const loginSecurity = [
  loginRateLimit,
  // smartSlowDown, // Temporarily disabled
];

// ===== SIMPLE SECURITY HEADERS =====
export const simpleSecurityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// ===== REQUEST SIZE LIMITER =====
export const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request too large. Maximum size is 10MB.',
      error: 'REQUEST_TOO_LARGE'
    });
  }
  
  next();
};

export default {
  securityMiddleware,
  loginSecurity,
  simpleSecurityHeaders,
  requestSizeLimit,
};
