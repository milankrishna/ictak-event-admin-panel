import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';
import eventRoutes from './routes/eventRoutes.js';
import connectDB from './config/db.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Vercel imports this app directly; local startup still uses src/server.js.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy.' });
});

app.use('/api/events', eventRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.use(errorHandler);

export default app;
