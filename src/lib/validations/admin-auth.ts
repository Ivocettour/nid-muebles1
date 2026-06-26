import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Ingresá un correo válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
  rememberSession: z.boolean().optional()
});

const passwordFields = {
  newPassword: z
    .string()
    .min(12, "La contraseña debe tener al menos 12 caracteres.")
    .regex(/[A-Z]/, "Incluí al menos una mayúscula.")
    .regex(/[a-z]/, "Incluí al menos una minúscula.")
    .regex(/[0-9]/, "Incluí al menos un número.")
    .regex(/[^A-Za-z0-9]/, "Incluí al menos un símbolo."),
  confirmPassword: z.string()
};

function matchingPasswords<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"]
  });
}

export const newPasswordSchema = matchingPasswords(passwordFields);

export const requestPasswordResetSchema = z.object({
  email: z.string().email("Ingresá un correo válido.")
});

export const confirmPasswordResetSchema = matchingPasswords({
  email: z.string().email("Ingresá un correo válido."),
  code: z.string().min(4, "Ingresá el código recibido por correo."),
  ...passwordFields
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
export type RequestPasswordResetValues = z.infer<typeof requestPasswordResetSchema>;
export type ConfirmPasswordResetValues = z.infer<typeof confirmPasswordResetSchema>;
