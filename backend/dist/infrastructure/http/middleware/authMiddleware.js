"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../../config/env");
// Middleware para proteger rutas que requieren autenticación
// Verifica el token JWT en el encabezado de autorización
// Si el token es válido, agrega el userId a la solicitud y llama a next()
// Si no es válido, responde con un error 401 (No autorizado)
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "No autorizado" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (payload.type !== "access") {
            return res.status(401).json({ error: "No autorizado" });
        }
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ error: "No autorizado" });
    }
}
