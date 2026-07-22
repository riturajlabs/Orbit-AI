/**
 * @file routes/authRoutes.js
 * @description Authentication routes (Register, Login, Logout, Refresh Token).
 */

import express from 'express';
import * as authController from '../controllers/authController.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // 👈 Asli naam use kiya
import upload from '../middlewares/uploadMiddleware.js'; // Multer middleware

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 */
router.post('/register', authRateLimiter, authController.register);

/**
 * @route POST /api/auth/login
 * @description Login user and return JWT token
 */
router.post('/login', authRateLimiter, authController.login);

/**
 * @route POST /api/auth/logout
 * @description Logout user
 */
router.post('/logout', authController.logout);

/**
 * @route PUT /api/auth/profile
 * @description Update user profile (Name, Username, Avatar)
 */
// 👈 Yahan bhi authMiddleware lagaya
router.put(
 '/profile',
 authMiddleware,
 upload.single('avatar'),
 (req,res,next)=>{

    console.log('MULTER FILE:', req.file);

    next();

 },
 authController.updateProfile,
);

export default router;