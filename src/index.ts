import 'dotenv/config';
import express from 'express';
import appRoutes from './routes/index.js';
import { startReminderCron, startImpulseCron } from './utility/reminder.cron.js';
import { GlobalErrorHandler } from './middlewares/error.middleware.js';

const PORT = 5000;
const app = express();

app.use(express.json());

// Menghubungkan semua route dari folder routes
app.use('/api', appRoutes);

app.use(GlobalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

startReminderCron();
startImpulseCron();
