import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// 👇 Ye dono import add karein
import path from 'path';
import { fileURLToPath } from 'url';

import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';



// 👇 ES Modules me __dirname aisay set karte hain
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Taaki frontend se image access ho sake
}));

const allowedOrigins = [
  'https://orbit-ai-client.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
app.use('/api', apiRouter);

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'AI Chatbot API is active.' });
});

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;