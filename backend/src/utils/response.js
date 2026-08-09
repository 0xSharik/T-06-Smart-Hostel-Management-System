/**
 * src/utils/response.js — Standardized API Response Utility
 *
 * Responsibilities:
 *  - Enforce a consistent JSON response shape across ALL endpoints
 *  - Provide named helper functions for success and error responses
 *  - Prevent controllers from calling res.json() directly
 *
 * Response Shape:
 *   Success: { success: true,  message: "...", data: {...}, meta: {...} }
 *   Error:   { success: false, message: "...", errors: [...] }
 *
 * Usage:
 *   const { sendSuccess, sendError } = require('../utils/response');
 *   sendSuccess(res, data, 'User created', 201);
 *   sendError(res, 'Unauthorized', 401);
 */

/**
 * Send a successful response.
 *
 * @param {import('express').Response} res  - Express response object
 * @param {*}      data                     - Payload to send (object, array, null)
 * @param {string} message                  - Human-readable success message
 * @param {number} statusCode               - HTTP status code (default: 200)
 * @param {object} meta                     - Optional pagination or extra metadata
 */
const sendSuccess = (res, data = null, message = "Success", statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 *
 * @param {import('express').Response} res  - Express response object
 * @param {string} message                  - Human-readable error message
 * @param {number} statusCode               - HTTP status code (default: 500)
 * @param {Array}  errors                   - Optional array of validation errors
 */
const sendError = (res, message = "Internal Server Error", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response.
 * Automatically builds the meta pagination object.
 */
const sendPaginated = (res, data, total, page, limit, message = "Success") => {
  const totalPages = Math.ceil(total / limit);
  const meta = {
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return sendSuccess(res, data, message, 200, meta);
};

module.exports = { sendSuccess, sendError, sendPaginated };
