// Security middleware

/**
 * Middleware to set security headers including CSP
 */
export function securityHeadersMiddleware(req, res, next) {
  // Set Content Security Policy with frame-ancestors and safer script handling
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src *; frame-src *; base-uri 'self'; form-action 'self'; child-src *; frame-ancestors 'none'");
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}