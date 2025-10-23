"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = void 0;
const mongoose_1 = require("mongoose");
// Definimos el esquema de Mongoose para el modelo de refresh token
const schema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    token: { type: String, required: true },
    expireAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
}, { timestamps: true });
// Índice único para evitar tokens duplicados por usuario
schema.index({ userId: 1, token: 1 }, { unique: true, name: "uniq_user_token" });
exports.RefreshTokenModel = (0, mongoose_1.model)("RefreshToken", schema);
