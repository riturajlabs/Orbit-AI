/**
 * @file rateLimiter.js
 */

import rateLimit from 'express-rate-limit';

const isDevelopment = process.env.NODE_ENV === 'development';

// API Rate Limiter
export const apiRateLimiter = isDevelopment
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          status: 'error',
          message: 'Too many requests, please try again later.',
        });
      },
    });

// Authentication Rate Limiter
export const authRateLimiter = isDevelopment
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          status: 'error',
          message:
            'Too many authentication attempts, please try again later.',
        });
      },
    });