import mongoose, { Schema, model} from "mongoose";

// Definimos la interfaz IRefreshToken para el modelo de refresh token
export interface IRefreshToken {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    token: string;
    expireAt: Date;
    revokedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// Definimos el esquema de Mongoose para el modelo de refresh token
const schema = new Schema<IRefreshToken>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        token: { type: String, required: true },
        expireAt: { type: Date, required: true, index: true },
        revokedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// Índice único para evitar tokens duplicados por usuario
schema.index({ userId: 1, token: 1 }, { unique: true, name: "uniq_user_token" });


export const RefreshTokenModel = model<IRefreshToken>("RefreshToken", schema);