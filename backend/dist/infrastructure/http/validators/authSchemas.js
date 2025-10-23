"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Registro de un nuevo usuario
// El esquema valida que el email sea una cadena con formato de correo electrónico
// y que la contraseña tenga al menos 8 caracteres.
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
// Inicio de sesión de un usuario existente
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
// Solicitud de un nuevo token de acceso utilizando un token de refresco
exports.refreshSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().length(64),
});
