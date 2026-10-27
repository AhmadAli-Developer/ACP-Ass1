/**
 * Standardized API Response Utilities
 * Ensures consistent JSON response structure across the entire application
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = undefined) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== undefined && { meta })
  };
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
