import { z } from 'zod';

// Registro de un nuevo usuario
// El esquema valida que el email sea una cadena con formato de correo electrónico
// y que la contraseña tenga al menos 8 caracteres.
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

// Inicio de sesión de un usuario existente
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

// Solicitud de un nuevo token de acceso utilizando un token de refresco
export const refreshSchema = z.object({
    refresh_token: z.string().length(64),
});
