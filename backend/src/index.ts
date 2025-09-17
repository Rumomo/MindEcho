import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mindecho';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mindecho-api', time: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ message: 'MindEcho API v0.1' });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => logger.info(`API listening on http://localhost:${PORT}`));
  } catch (err) {
    logger.error({ err }, 'Failed to start API');
    process.exit(1);
  }
}

start();
