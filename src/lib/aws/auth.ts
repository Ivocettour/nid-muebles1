"use client";

import {
  confirmResetPassword,
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser as amplifyGetCurrentUser,
  resetPassword,
  signIn,
  signOut,
  type AuthUser
} from "aws-amplify/auth";
import { configureAmplifyAuth, isAmplifyAuthConfigured } from "@/lib/aws/amplify-config";

export { isAmplifyAuthConfigured };

export type AdminGroup = "Admin" | "Editor";
export type AdminSignInResult = { status: "signedIn"; user: AuthUser; groups: string[] } | { status: "newPasswordRequired" };

export function translateCognitoError(error: unknown) {
  const name = error && typeof error === "object" && "name" in error ? String(error.name) : "";
  const message = error instanceof Error ? error.message : "";

  if (name === "NotAuthorizedException" || name === "UserNotFoundException") return "Correo o contraseña incorrectos.";
  if (name === "UserNotConfirmedException") return "La cuenta todavía no fue confirmada.";
  if (name === "PasswordResetRequiredException") return "Debés restablecer tu contraseña.";
  if (name === "TooManyRequestsException") return "Demasiados intentos. Esperá unos minutos.";
  if (name === "LimitExceededException") return "Se alcanzó temporalmente el límite de intentos.";
  if (name === "InvalidPasswordException") return "La contraseña no cumple los requisitos de seguridad.";
  if (message.includes("not configured") || message === "auth-not-configured") return "Falta configurar Cognito en las variables de entorno.";

  return "No pudimos completar la operación. Revisá los datos e intentá nuevamente.";
}

export function ensureAuthConfigured() {
  configureAmplifyAuth();
  if (!isAmplifyAuthConfigured()) throw new Error("auth-not-configured");
}

export async function getCurrentSession() {
  ensureAuthConfigured();
  return fetchAuthSession();
}

export async function getCurrentUser() {
  ensureAuthConfigured();
  return amplifyGetCurrentUser();
}

export async function getUserGroups() {
  const session = await getCurrentSession();
  const idTokenGroups = (session.tokens?.idToken?.payload["cognito:groups"] as string[] | undefined) ?? [];
  const accessTokenGroups = (session.tokens?.accessToken?.payload["cognito:groups"] as string[] | undefined) ?? [];
  return Array.from(new Set([...idTokenGroups, ...accessTokenGroups].map((group) => group.trim()).filter(Boolean)));
}

export function hasAdminAccess(groups: string[]) {
  return groups.includes("Admin") || groups.includes("Editor");
}

export async function signInAdmin(email: string, password: string): Promise<AdminSignInResult> {
  ensureAuthConfigured();
  const result = await signIn({ username: email, password });

  if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
    return { status: "newPasswordRequired" };
  }

  const user = await getCurrentUser();
  const groups = await getUserGroups();

  if (!hasAdminAccess(groups)) {
    await signOutAdmin();
    throw new Error("admin-access-denied");
  }

  return { status: "signedIn", user, groups };
}

export async function completeNewPasswordChallenge(newPassword: string) {
  ensureAuthConfigured();
  await confirmSignIn({ challengeResponse: newPassword });
  const user = await getCurrentUser();
  const groups = await getUserGroups();

  if (!hasAdminAccess(groups)) {
    await signOutAdmin();
    throw new Error("admin-access-denied");
  }

  return { user, groups };
}

export async function requestPasswordReset(email: string) {
  ensureAuthConfigured();
  await resetPassword({ username: email });
}

export async function confirmPasswordReset(email: string, code: string, newPassword: string) {
  ensureAuthConfigured();
  await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

export async function signOutAdmin() {
  ensureAuthConfigured();
  await signOut();
}
