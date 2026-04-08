import 'dotenv/config';
import express from 'express';
import appRoutes from './routes/index.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Menghubungkan semua route dari folder routes
app.use('/api', appRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});