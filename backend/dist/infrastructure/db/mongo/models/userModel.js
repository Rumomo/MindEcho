"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
// Definimos el esquema de Mongoose para el modelo de usuario
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, trim: true },
    emailLower: { type: String, required: true, lowercase: true, trim: true, select: false },
    passwordHash: { type: String, required: true },
}, { timestamps: true });
// Middleware para establecer emailLower antes de guardar
userSchema.index({ emailLower: 1 }, { unique: true, name: "uniq_email_ci" });
// Middleware para establecer emailLower antes de validar
userSchema.pre("validate", function (next) {
    if (this.email) {
        this.emailLower = this.email.toLowerCase();
        next();
    }
});
// Configuramos la transformación al convertir a JSON
// ...rest es un operador de propagación que captura todas las demás propiedades
userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const { passwordHash, emailLower, ...rest // Excluimos passwordHash y emailLower del objeto retornado 
         } = ret;
        return ret;
    },
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
