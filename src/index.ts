import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { apiReference } from '@scalar/express-api-reference';
import appRoutes from './routes/index.js';
import {
  startReminderCron,
  startImpulseCron,
} from './utility/reminder.cron.js';
import { GlobalErrorHandler } from './middlewares/error.middleware.js';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());

// Konfigurasi CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*', // Izinkan semua di dev, limit di prod
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Scalar API Documentation
const openApiSpecPath = path.resolve(process.cwd(), 'openapi.yaml');
if (fs.existsSync(openApiSpecPath)) {
  const spec = fs.readFileSync(openApiSpecPath, 'utf8');
  app.use(
    '/docs',
    apiReference({
      spec: {
        content: spec,
      },
      theme: 'purple',
    }),
  );
}

// Health check endpoint untuk platform deployment
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Kosongin API is running',
    environment: process.env.NODE_ENV,
  });
});

// Menghubungkan semua route dari folder routes
app.use('/api', appRoutes);

app.use(GlobalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

startReminderCron();
startImpulseCron();
