import { Request, Response } from "express";
import { UserModel } from "../../db/mongo/models/userModel";
import { onboardingSchema, OnboardingData } from "../validators/onboardingSchemas";
import type { AuthenticatdRequest } from "../middleware/authMiddleware";

// Controlador para manejar el onboarding del usuario
// Este controlador recibe los datos de consentimiento del usuario
// los valida utilizando el esquema definido en onboardingSchemas.ts 
export async function getConsent(req: AuthenticatdRequest, res: Response) {
    const userId = await UserModel.findById(req.userId);
    if (!userId) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }
    // Nota personal: ?? es un operador de fusión nula que devuelve el operando de la derecha
    // si el operando de la izquierda es null o undefined
    // en este caso, si userId.consent es null o undefined, se devuelve null explícitamente
    return res.status(200).json({ consent: userId.consent ?? null });
}

// Controlador para establecer el consentimiento del usuario
// Valida los datos recibidos con el esquema de onboarding
// Si son válidos, actualiza el documento del usuario en la base de datos
export async function setConsent(req: AuthenticatdRequest & { body: OnboardingData }, res: Response) {
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Datos de consentimiento inválidos.", details: parsed.error.flatten() });
    }

    const { age, acceptedTerms, acceptedPrivacyPolicy, locale = "es-ES", version = "1.0" } = parsed.data;
    const user = await UserModel.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }
    user.consent = {
        age,
        acceptTerms: acceptedTerms,
        acceptPrivacy: acceptedPrivacyPolicy,
        locale,
        version,
        acceptedAt: new Date(),
    };
    await user.save();

    return res.status(200).json({ OK: true, consent: user.consent });
}