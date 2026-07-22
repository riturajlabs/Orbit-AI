/**
 * @file db.js
 * @description MongoDB database connection configuration using Mongoose.
 */

import mongoose from 'mongoose';

import './env.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('[Config] Initializing MongoDB connection...');
    
    await mongoose.connect(mongoURI);

    console.log('[Config] MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('[Config] MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
