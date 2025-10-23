import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';

// Extiende la interfaz Request para incluir el ID del usuario autenticado
// userId es opcional porque puede no estar presente en todas las solicitudesx
export interface AuthenticatdRequest extends Request {
    userId?: string;
}

// Middleware para proteger rutas que requieren autenticación
// Verifica el token JWT en el encabezado de autorización
// Si el token es válido, agrega el userId a la solicitud y llama a next()
// Si no es válido, responde con un error 401 (No autorizado)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "No autorizado" });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as any;
        if (payload.type !== "access") {
            return res.status(401).json({ error: "No autorizado" });
        }
        (req as any).userId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ error: "No autorizado" });
    }
}
 
