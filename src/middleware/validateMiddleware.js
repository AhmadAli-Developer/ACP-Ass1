const mongoose = require('mongoose');
const { sendError } = require('../utils/apiResponse');

/**
 * Validates that a route param (default 'id') is a valid MongoDB ObjectId.
 * Prevents CastError crashes and returns 400 for malformed IDs.
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, `Invalid ID format for parameter '${paramName}'.`);
    }
    next();
  };
};

/**
 * Validates that all required fields are present and not empty in req.body.
 */
const validateRequiredFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      const value = req.body[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return sendError(
        res,
        400,
        `Missing or empty required field(s): ${missing.join(', ')}`,
        { missingFields: missing }
      );
    }
    next();
  };
};

module.exports = {
  validateObjectId,
  validateRequiredFields
};
