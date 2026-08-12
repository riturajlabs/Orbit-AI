import dotenv from 'dotenv';

dotenv.config();

const maskSecret = (value) => {
  if (!value) {
    return 'NOT SET';
  }

  return 'SET';
};

const logSecret = (key) => {
  const raw = process.env[key];

  if (key === 'JWT_SECRET' || key.includes('CLOUDINARY_API_SECRET')) {
    console.log(`[Config] ${key}: ${maskSecret(raw)}`);
    return;
  }

  console.log(`[Config] ${key}: ${maskSecret(raw)}`);
};

const SECRET_KEYS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'AI_SERVICE_KEY',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

console.log('[Config] Environment loaded');
console.log(`[Config] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(
  `[Config] AI_SERVICE_URL: ${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000 (default)'}`,
);

SECRET_KEYS.forEach(logSecret);
