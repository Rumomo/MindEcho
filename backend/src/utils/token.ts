import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TTL = '15m'; // Tiempo de vida del token de acceso
const REFRESH_TTL_DAYS = 7; // Tiempo de vida del token de refresco

// Acceso al token. Genera un token JWT firmado con el ID del usuario y una clave secreta.
export function signAccessToken(userId: string, secret: string) {
    return jwt.sign({ 
        sub: userId, type: 'access' 
    }, 
        secret, 
        { 
            expiresIn: ACCESS_TTL 
        });
}

// Refresco del token. Genera un token de refresco aleatorio, su hash y la fecha de expiración.
export function generarRefreshToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const hash = hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
    return { token, hash, expiresAt };
}

// Hash del token de refresco. Crea un hash SHA-256 del token proporcionado.
// SHA-256 es un algoritmo de hash criptográfico que produce un hash de 256 bits (32 bytes).
export function hashRefreshToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}