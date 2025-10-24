import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { getConsent, setConsent } from "../controllers/onboardingController";
import { asyncHandler } from "../../../utils/asyncHandler";

// Definimos las rutas relacionadas con el onboarding del usuario
// Incluye rutas para obtener y establecer el consentimiento del usuario
export const onboardingRouter = Router();

// Ruta para obtener el consentimiento del usuario
// Utiliza el middleware requireAuth para asegurar que el usuario esté autenticado
// y el asyncHandler para manejar errores de manera centralizada
onboardingRouter.get(
    "/consent",
    requireAuth,
    asyncHandler(getConsent)
);

// Ruta para establecer el consentimiento del usuario
// También utiliza requireAuth y asyncHandler
onboardingRouter.post(
    "/consent",
    requireAuth,
    asyncHandler(setConsent)
);