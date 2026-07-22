/**
 * @file errorMiddleware.js
 * @description Global error handling and 404 middleware for the application.
 */

/**
 * Not Found Handler - Returns 404 for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
    path: req.originalUrl,
    method: req.method,
  });
};

/**
 * Global Error Handler - Catches all errors thrown in the application
 */
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details for debugging
  // console.error('[Error]', {
  //   status,
  //   message,
  //   url: req.originalUrl,
  //   method: req.method,
  //   stack: err.stack,
  // });

  console.error('FULL ERROR:', err);
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      status: 'error',
      message: `Duplicate entry for field: ${field}`,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }

  // Send generic error response
  res.status(status).json({
    status: 'error',
    message,
  });
};
