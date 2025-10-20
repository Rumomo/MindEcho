import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { loadEnv } from './config/env';
// Importar modelos para asegurar que se registren en Mongoose
import { UserModel } from './infrastructure/db/mongo/models/userModel';
import { RefreshTokenModel } from './infrastructure/db/mongo/models/refreshTokenModel';

//Cargar y validar variables de entorno
const env = loadEnv();

//Configurar logger
const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

//Crear servidor Express
const app = express();
app.disable('x-powered-by');

//Middlewares de seguridad
app.use(helmet());

//Configurar CORS(Compartir recursos entre orígenes)
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

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

//Rutas de la API
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mindecho-api', time: new Date().toISOString() });
});

//Ruta raíz
app.get('/', (_req, res) => {
  res.json({ message: 'MindEcho API v0.1' });
});

//Conectar a MongoDB y arrancar el servidor
async function start() {
  try {
    await mongoose.connect(env.MONGO_URI);
    // Asegurar que los índices de los modelos estén sincronizados
    await Promise.all([
      UserModel.syncIndexes(),
      RefreshTokenModel.syncIndexes(),
    ]);
    logger.info('Conectado a MongoDB');
    app.listen(env.PORT, () => logger.info(`API escuchando en http://localhost:${env.PORT}`));
  } catch (err) {
    logger.error({ err }, 'Fallo al levantar el API');
    process.exit(1);
  }
}

//Iniciar la aplicación
start();