"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.loadEnv = loadEnv;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Definir el esquema de validación para las variables de entorno
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    MONGO_URI: zod_1.z.string().min(1, 'Falta la variable de entorno MONGO_URI '),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET es demaciado corto, debe tener al menos 8 caracteres'),
    ACCESS_TOKEN_SECRET: zod_1.z.string().min(8, 'ACCESS_TOKEN_SECRET es demaciado corto, debe tener al menos 8 caracteres').default('clave_super_secreta_para_access_token_que_debes_cambiar_ya_por_una_mas_segura'),
    CORS_ORIGIN: zod_1.z.string().min(1, 'Falta la variable de entorno CORS_ORIGIN '),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().default(60000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().default(100),
});
// Función para cargar y validar las variables de entorno
function loadEnv() {
    const parsedEnv = envSchema.safeParse(process.env);
    if (!parsedEnv.success) {
        console.error('Error al validar las variables de entorno:', console.error(parsedEnv.error.flatten().fieldErrors));
        process.exit(1);
    }
    return parsedEnv.data;
}
// Exportar las variables de entorno validadas
exports.env = loadEnv();
