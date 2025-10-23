"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.generarRefreshToken = generarRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const ACCESS_TTL = '15m'; // Tiempo de vida del token de acceso
const REFRESH_TTL_DAYS = 7; // Tiempo de vida del token de refresco
// Acceso al token. Genera un token JWT firmado con el ID del usuario y una clave secreta.
function signAccessToken(userId, secret) {
    return jsonwebtoken_1.default.sign({
        sub: userId, type: 'access'
    }, secret, {
        expiresIn: ACCESS_TTL
    });
}
// Refresco del token. Genera un token de refresco aleatorio, su hash y la fecha de expiración.
function generarRefreshToken() {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const hash = hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    return { token, hash, expiresAt };
}
// Hash del token de refresco. Crea un hash SHA-256 del token proporcionado.
// SHA-256 es un algoritmo de hash criptográfico que produce un hash de 256 bits (32 bytes).
function hashRefreshToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
