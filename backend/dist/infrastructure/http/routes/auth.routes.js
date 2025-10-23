"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userModel_1 = require("../../db/mongo/models/userModel");
// Definir las rutas de autenticación
exports.authRouter = (0, express_1.Router)();
// Ruta para registrar un nuevo usuario
exports.authRouter.post('/register', authController_1.register);
// Ruta para iniciar sesión de un usuario existente
exports.authRouter.post('/login', authController_1.login);
// Ruta para solicitar un nuevo token de acceso utilizando un token de refresco
exports.authRouter.post('/refresh', authController_1.refrsh);
// Ruta para cerrar sesión de un usuario
exports.authRouter.post('/logout', authController_1.logout);
// Ruta para obtener información del usuario autenticado
exports.authRouter.get('/user/me', authMiddleware_1.requireAuth, async (req, res) => {
    const user = await userModel_1.UserModel.findById(req.userId);
    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
});
