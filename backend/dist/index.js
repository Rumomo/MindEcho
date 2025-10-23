"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
// Importar modelos para asegurar que se registren en Mongoose
const userModel_1 = require("./infrastructure/db/mongo/models/userModel");
const refreshTokenModel_1 = require("./infrastructure/db/mongo/models/refreshTokenModel");
// Importar rutas, supervisa que las rutas de autenticación estén disponibles
const auth_routes_1 = require("./infrastructure/http/routes/auth.routes");
//Cargar y validar variables de entorno
const env = (0, env_1.loadEnv)();
//Configurar logger
const logger = (0, pino_1.default)({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});
//Crear servidor Express
const app = (0, express_1.default)();
app.disable('x-powered-by');
//Middlewares de seguridad
app.use((0, helmet_1.default)());
//Configurar CORS(Compartir recursos entre orígenes)
app.use((0, cors_1.default)({ origin: env.CORS_ORIGIN, credentials: true }));
//Middleware para parsear JSON
app.use(express_1.default.json());
//Middleware de logging HTTP
app.use((0, pino_http_1.default)({
    logger,
    serializers: {
        req(req) { return { method: req.method, url: req.url }; },
        res(res) { return { statusCode: res.statusCode }; },
    },
}));
//Usar rutas de autenticación
app.use('/api', auth_routes_1.authRouter);
app.use((error, _req, res, _next) => {
    logger.error({ err: error }, 'Error no manejado en la aplicación');
    res.status(500).json({ error: 'Error interno del servidor' });
});
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
        await mongoose_1.default.connect(env.MONGO_URI);
        // Asegurar que los índices de los modelos estén sincronizados
        await Promise.all([
            userModel_1.UserModel.syncIndexes(),
            refreshTokenModel_1.RefreshTokenModel.syncIndexes(),
        ]);
        logger.info('Conectado a MongoDB');
        app.listen(env.PORT, () => logger.info(`API escuchando en http://localhost:${env.PORT}`));
    }
    catch (err) {
        logger.error({ err }, 'Fallo al levantar el API');
        process.exit(1);
    }
}
//Iniciar la aplicación
start();
