import 'dotenv/config';
import express from 'express';
import appRoutes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Menghubungkan semua route dari folder routes
app.use('/api', appRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});