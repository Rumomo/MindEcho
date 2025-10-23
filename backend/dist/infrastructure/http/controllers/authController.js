"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refrsh = refrsh;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = require("../../db/mongo/models/userModel");
const refreshTokenModel_1 = require("../../db/mongo/models/refreshTokenModel");
const authSchemas_1 = require("../validators/authSchemas");
const token_1 = require("../../../utils/token");
const env_1 = require("../../../config/env");
// Número de rondas para el hashing de contraseñas
const SALT_ROUNDS = 10;
// Registro de un nuevo usuario
// Valida la solicitud, verifica si el correo electrónico ya está registrado,
// hashea la contraseña y crea un nuevo usuario en la base de datos.
async function register(req, res) {
    const parse = authSchemas_1.registerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Solicitud invalidad', details: parse.error.errors });
    }
    // Extraer y procesar datos
    const { email, password } = parse.data;
    const emailLower = email.toLowerCase();
    // Verificar si el correo electrónico ya está registrado
    const existing = await userModel_1.UserModel.findOne({ email: emailLower }).lean();
    if (existing) {
        return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
    }
    // Hashear la contraseña y crear el usuario
    const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
    const user = await userModel_1.UserModel.create({ email, passwordHash });
    // Generar token de acceso
    // user._id!.toString() obtiene el ID del usuario recién creado como una cadena.
    // ! indica a TypeScript que estamos seguros de que _id no es nulo o indefinido.
    const accessToken = (0, token_1.signAccessToken)(user._id.toString(), env_1.env.ACCESS_TOKEN_SECRET);
    const { token: refreshToken, hash, expiresAt } = (0, token_1.generarRefreshToken)();
    await refreshTokenModel_1.RefreshTokenModel.create({ userId: user._id, token: hash, expireAt: expiresAt });
    // Responder con los tokens y la información del usuario
    return res.status(201).json({
        accessToken,
        refreshToken,
        user: user.toJSON(),
    });
}
// Inicio de sesión de un usuario existente
// Valida la solicitud, verifica las credenciales y genera tokens de acceso y refresco.
async function login(req, res) {
    const parse = authSchemas_1.loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Solicitud invalidad', details: parse.error.errors });
    }
    // Extraer y procesar datos
    const { email, password } = parse.data;
    const emailLower = email.toLowerCase();
    // Buscar el usuario por correo electrónico
    const user = await userModel_1.UserModel.findOne({ email: emailLower }).select('+passwordHash');
    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Verificar la contraseña
    const passwordMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Generar tokens
    const accessToken = (0, token_1.signAccessToken)(user._id.toString(), env_1.env.ACCESS_TOKEN_SECRET);
    const { token: refreshToken, hash, expiresAt } = (0, token_1.generarRefreshToken)();
    await refreshTokenModel_1.RefreshTokenModel.create({ userId: user._id, token: hash, expireAt: expiresAt });
    // Responder con los tokens y la información del usuario
    return res.status(200).json({
        accessToken,
        refreshToken,
        user: user.toJSON(),
    });
}
// Solicitud de un nuevo token de acceso utilizando un token de refresco
// Valida el token de refresco, verifica su validez y genera nuevos tokens de acceso y refresco.
// También revoca el token de refresco anterior.
// Si el token de refresco es inválido o ha expirado, responde con un error.
// Si es válido, revoca el token antiguo y emite nuevos tokens.
// El nuevo token de refresco se almacena en la base de datos.
// El token de acceso se firma con el ID del usuario asociado al token de refresco.
// Finalmente, responde con los nuevos tokens.
async function refrsh(req, res) {
    const parse = authSchemas_1.refreshSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Solicitud invalidad' });
    }
    // Extraer el token de refresco de la solicitud
    const { refresh_token } = parse.data;
    const hash = (0, token_1.hashRefreshToken)(refresh_token);
    // Buscar el token de refresco en la base de datos
    const record = await refreshTokenModel_1.RefreshTokenModel.findOne({ token: hash, revokedAt: null });
    if (!record) {
        return res.status(401).json({ error: 'Token de refresco inválido' });
    }
    if (record.expireAt.getTime() < Date.now()) {
        return res.status(401).json({ error: 'Token de refresco expirado' });
    }
    // Revocar el token de refresco antiguo
    record.revokedAt = new Date();
    await record.save();
    // Generar y almacenar nuevos tokens
    const access_token = (0, token_1.signAccessToken)(record.userId.toString(), env_1.env.JWT_SECRET);
    const { token: newRefreshToken, hash: newHash, expiresAt } = (0, token_1.generarRefreshToken)();
    await refreshTokenModel_1.RefreshTokenModel.create({ userId: record.userId, token: newHash, expireAt: expiresAt });
    return res.json({
        accessToken: access_token,
        refreshToken: newRefreshToken,
    });
}
// Cerrar sesión de un usuario
// Valida el token de refresco y lo revoca para cerrar la sesión del usuario.
// Si el token de refresco es inválido, responde con un error.
// Si es válido, marca el token como revocado en la base de datos.
// Finalmente, responde con un mensaje de éxito.
async function logout(req, res) {
    const parse = authSchemas_1.refreshSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Solicitud invalidad' });
    }
    // Extraer el token de refresco de la solicitud
    const { refresh_token } = parse.data;
    const hash = (0, token_1.hashRefreshToken)(refresh_token);
    const record = await refreshTokenModel_1.RefreshTokenModel.findOne({ token: hash, revokedAt: null });
    if (!record) {
        return res.status(401).json({ error: 'Token de refresco inválido' });
    }
    // Revocar el token de refresco
    record.revokedAt = new Date();
    await record.save();
    // Responder con un mensaje de éxito
    return res.json({
        message: 'Sesión cerrada exitosamente',
    });
}
