import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import appRoutes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Menghubungkan semua route dari folder routes
app.use('/api', appRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
