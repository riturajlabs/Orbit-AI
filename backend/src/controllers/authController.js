import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
};

export const register = async (req, res, next) => {
  try {
    // 👇 name add kiya gaya
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Username or email already exists',
      });
    }

    // 👇 user create karte waqt name pass kiya
    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user (Supports login via Email OR Username)
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    // 👇 Accept emailOrUsername instead of just email
    const { emailOrUsername, email, password } = req.body;

    // Backward compatibility: handle if frontend sends 'email' or 'emailOrUsername'
    const identifier = emailOrUsername || email;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email/username and password',
      });
    }

    // Find user by either email OR username (case-insensitive search for lowercase usernames/emails)
    const normalizedIdentifier = identifier.trim().toLowerCase();
    
    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'User logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, username } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;

    // Agar image aayi hai, toh uska public URL path update karo
   if(req.file){

    updateData.avatar = req.file.path;

    }
    // 👈 Yahan humne req.userId use kiya hai jo aapke authMiddleware se aa raha hai
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser.toJSON(),
      },
    });
  } catch (error) {
    // Check for duplicate username error
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Username is already taken',
      });
    }
    next(error);
  }
};