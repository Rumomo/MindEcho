import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Definir el esquema de validación para las variables de entorno
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGO_URI: z.string().min(1, 'Falta la variable de entorno MONGO_URI '),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET es demaciado corto, debe tener al menos 8 caracteres'),
  ACCESS_TOKEN_SECRET: z.string().min(8, 'ACCESS_TOKEN_SECRET es demaciado corto, debe tener al menos 8 caracteres').default('clave_super_secreta_para_access_token_que_debes_cambiar_ya_por_una_mas_segura'),
  CORS_ORIGIN: z.string().min(1, 'Falta la variable de entorno CORS_ORIGIN '),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

// Función para cargar y validar las variables de entorno
export function loadEnv() {
    const parsedEnv = envSchema.safeParse(process.env);
    if (!parsedEnv.success) {
        console.error('Error al validar las variables de entorno:',
        console.error(parsedEnv.error.flatten().fieldErrors));
        process.exit(1);
    }
    return parsedEnv.data;
}
// Exportar las variables de entorno validadas
export const env = loadEnv();