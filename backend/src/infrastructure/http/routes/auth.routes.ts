import { Router } from 'express';
import { register, login, refrsh, logout } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { UserModel } from '../../db/mongo/models/userModel';

// Definir las rutas de autenticación
export const authRouter = Router();

// Ruta para registrar un nuevo usuario
authRouter.post('/register', register);

// Ruta para iniciar sesión de un usuario existente
authRouter.post('/login', login);

// Ruta para solicitar un nuevo token de acceso utilizando un token de refresco
authRouter.post('/refresh', refrsh);

// Ruta para cerrar sesión de un usuario
authRouter.post('/logout', logout);

// Ruta para obtener información del usuario autenticado
authRouter.get('/user/me', requireAuth, async (req, res) => {
    const user = await UserModel.findById((req as any).userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
});


