const { sendError } = require('../utils/apiResponse');

/**
 * 404 Not Found Middleware for unknown routes
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log unexpected errors during non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path} format: ${err.value}`);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', { details: errorDetails });
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    return sendError(
      res,
      400,
      `Duplicate value entered for ${duplicateFields || 'unique field'}. Please use another value.`
    );
  }

  // Handle JWT Malformed / Signature Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token');
  }

  // Handle JWT Expiration
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token has expired');
  }

  // Default to 500 Server Error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred';
  return sendError(res, statusCode, message);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
