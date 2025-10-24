import { z } from "zod";

// Esquema de validación para los datos de onboarding del usuario
// Utiliza la librería zod para definir las reglas de validación
// por ejemplo, la edad mínima es 16 años
// y tanto los términos como la política de privacidad deben ser aceptados
// además, se permiten campos opcionales para locale y version con valores por defecto
export const onboardingSchema = z.object({
    age: z.number().min(16, "Debes tener al menos 16 años para registrarte."),
    acceptedTerms: z.literal(true, {
        errorMap: () => ({ message: "Debes aceptar los términos y condiciones." }),
    }),
    acceptedPrivacyPolicy: z.literal(true, {
        errorMap: () => ({ message: "Debes aceptar la política de privacidad." }),
    }),
    locale: z.string().default("es-ES").optional(),
    version: z.string().default("1.0").optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;