"use client";

import { confirmSignIn, fetchAuthSession, getCurrentUser, signIn, signOut, type AuthUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { configureAmplify, isCognitoConfigured } from "@/lib/aws/amplify";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configureAmplify();
    if (!isCognitoConfigured()) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(async (currentUser) => {
        setUser(currentUser);
        const session = await fetchAuthSession();
        setGroups((session.tokens?.idToken?.payload["cognito:groups"] as string[] | undefined) ?? []);
      })
      .catch(() => {
        setUser(null);
        setGroups([]);
      })
      .finally(() => {
      setLoading(false);
      });
  }, []);

  async function login(email: string, password: string) {
    configureAmplify();
    const result = await signIn({ username: email, password });
    if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
      throw new Error("Cognito requiere cambiar la contraseña inicial. Completá el cambio desde el flujo configurado en Cognito o agregá una pantalla de cambio de contraseña.");
    }
    const currentUser = await getCurrentUser();
    const session = await fetchAuthSession();
    setUser(currentUser);
    setGroups((session.tokens?.idToken?.payload["cognito:groups"] as string[] | undefined) ?? []);
  }

  async function completeNewPassword(newPassword: string) {
    await confirmSignIn({ challengeResponse: newPassword });
  }

  async function logout() {
    await signOut();
    setUser(null);
    setGroups([]);
  }

  return { user, groups, loading, login, logout, completeNewPassword, configured: isCognitoConfigured() };
}
