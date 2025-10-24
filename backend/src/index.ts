import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import pino from 'pino';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env';
// Importar modelos para asegurar que se registren en Mongoose
import { UserModel } from './infrastructure/db/mongo/models/userModel';
import { RefreshTokenModel } from './infrastructure/db/mongo/models/refreshTokenModel';
// Importar rutas, supervisa que las rutas de autenticación estén disponibles
import { authRouter } from  './infrastructure/http/routes/auth.routes';
import { onboardingRouter } from './infrastructure/http/routes/onboarding.routes';
// Importar tipos
import { RequestHandler } from 'express';


//Cargar y validar variables de entorno
const env = loadEnv();

// Importar rate limiter
const limiter = rateLimit({
  windowMs: env!.RATE_LIMIT_WINDOW_MS || 60_000, // 1 minuto
  max: env!.RATE_LIMIT_MAX || 100, // límite de 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
});

//Configurar logger
const logger = pino({
  level: env!.NODE_ENV === 'production' ? 'info' : 'debug',
});

//Crear servidor Express
const app = express();
app.disable('x-powered-by');

//Middlewares de seguridad
app.use(helmet());

//Configurar CORS(Compartir recursos entre orígenes)
app.use(cors({ origin: env!.CORS_ORIGIN, credentials: true }));

// Aplicar rate limiting
app.use(limiter);

//Middleware para parsear JSON
app.use(express.json());

//Middleware de logging HTTP
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { method: req.method, url: req.url }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  })
);

//Usar rutas de autenticación
app.use('/api/auth', authRouter);

//Usar rutas de onboarding
app.use('/api/onboarding', onboardingRouter);

app.use((error: any, _req: any, res: any, _next: any) => {
  logger.error({ err: error }, 'Error no manejado en la aplicación');
  res.status(500).json({ error: 'Error interno del servidor' });
});

//Rutas de la API
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'mindecho-api', time: new Date().toISOString() });
});

//Ruta raíz
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'MindEcho API v0.1' });
});

//Conectar a MongoDB y arrancar el servidor
async function start() {
  try {
    await mongoose.connect(env!.MONGO_URI);
    // Asegurar que los índices de los modelos estén sincronizados
    await Promise.all([
      UserModel.syncIndexes(),
      RefreshTokenModel.syncIndexes(),
    ]);
    logger.info('Conectado a MongoDB');
    app.listen(env!.PORT, () => logger.info(`API escuchando en http://localhost:${env!.PORT}`));
  } catch (err) {
    logger.error({ err }, 'Fallo al levantar el API');
    process.exit(1);
  }
}

//Iniciar la aplicación
start();