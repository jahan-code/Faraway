import ApiError from '../utils/ApiError.js';
import errorConstants from '../utils/errors.js';

import { validationSchemas } from '../validations/index.js';
import { pathToRegexp } from 'path-to-regexp';

// Simple route matching fallback for critical routes
const simpleRouteMatch = (url, route) => {
    if (!route || !url) return false;
    
    // Exact match
    if (route === url) return true;
    
    // Handle dynamic routes with simple pattern matching
    if (route.includes(':')) {
        const routeParts = route.split('/');
        const urlParts = url.split('/');
        
        if (routeParts.length !== urlParts.length) return false;
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) continue; // Skip dynamic parts
            if (routeParts[i] !== urlParts[i]) return false;
        }
        return true;
    }
    
    return false;
};

const requestValidator = (req, res, next) => {
    try {
        const { method, originalUrl, body } = req;
        
        // Skip validation for static files, health checks, and OPTIONS requests
        if (originalUrl.startsWith('/uploads') || 
            originalUrl === '/favicon.ico' || 
            originalUrl === '/health' || 
            originalUrl === '/redis-health' ||
            method === 'OPTIONS') {
            return next();
        }
        
        // Extract route path without query parameters
        const fullURL = originalUrl.split('?')[0];
        
        // Skip validation for routes without schemas (more permissive)
        if (!validationSchemas || Object.keys(validationSchemas).length === 0) {
            return next();
        }

        // Match the route using path-to-regexp with better error handling
        let matchedRoute = null;
        try {
            matchedRoute = Object.keys(validationSchemas).find((route) => {
                try {
                    // Validate route pattern before parsing
                    if (!route || typeof route !== 'string' || route.trim() === '') {
                        return false;
                    }
                    
                    // Try path-to-regexp first
                    const { regexp } = pathToRegexp(route);
                    const isMatch = regexp.test(fullURL);
                    return isMatch;
                } catch (err) {
                    // Fallback to simple route matching if path-to-regexp fails
                    console.warn(
                        `⚠️ Path-to-regexp failed for "${route}", using fallback matching: ${err.message}`
                    );
                    return simpleRouteMatch(fullURL, route);
                }
            });
        } catch (err) {
            console.error(`❌ Route matching error: ${err.message}`);
            // Continue without validation if route matching fails
            return next();
        }

        // No matching route in validationSchemas - allow to pass through
        if (!matchedRoute) {
            // More permissive - don't block requests without schemas
            return next();
        }

        const routeSchemas = validationSchemas[matchedRoute];
        if (!routeSchemas) {
            return next();
        }

        const schema = routeSchemas[method];
        if (schema === null) {
            return next();
        }

        if (!schema) {
            return next();
        }

        // Skip validation for multipart form data
        if (req.is('multipart/form-data')) {
            return next();
        }

        // Only validate if body exists and schema is defined
        if (body && Object.keys(body).length > 0) {
            try {
                const { error } = schema.validate(body, { abortEarly: false });

                if (error) {
                    console.error(
                        `❌ Joi validation error in route ${method} ${matchedRoute}:`
                    );
                    error.details.forEach((detail) => {
                        console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
                    });

                    return next(new ApiError(error.details[0].message, 400));
                }
            } catch (validationErr) {
                console.error(`❌ Schema validation error: ${validationErr.message}`);
                // Continue without validation if schema validation fails
                return next();
            }
        }

        next();
    } catch (err) {
        console.error(`🔥 Uncaught validation middleware error: ${err.message}`);
        // Don't block requests on validation errors - just log and continue
        return next();
    }
};

export default requestValidator;
