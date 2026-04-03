import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import { legacyChat } from './controllers/legacyChatController.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { prisma } from './prisma/client.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function ensureRequiredEnv() {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'API is running.' });
});

app.post('/chat', legacyChat);

app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    ensureRequiredEnv();
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

const shutdownSignals = ['SIGINT', 'SIGTERM'];

for (const signal of shutdownSignals) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default app;

// this is my code and it is =beginf pushed with changes