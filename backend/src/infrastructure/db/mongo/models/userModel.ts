import mongoose, { Schema, model } from "mongoose";

// Definimos la interfaz IUser para el modelo de usuario
export interface IUser {
    _id?: mongoose.Types.ObjectId;
    email: string;
    emailLower: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Definimos el esquema de Mongoose para el modelo de usuario
const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, trim: true },
        emailLower: { type: String, required: true, lowercase: true, trim: true, select: false},
        passwordHash: { type: String, required: true },
    },
    { timestamps: true }
);

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
        const { 
            passwordHash, 
            emailLower,
            ...rest // Excluimos passwordHash y emailLower del objeto retornado 
        } = ret;
        return ret;
    },
});

export const UserModel = model<IUser>("User", userSchema);