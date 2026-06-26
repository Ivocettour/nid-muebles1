"use client";

import type { AuthUser } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import {
  completeNewPasswordChallenge,
  getCurrentUser,
  getUserGroups,
  hasAdminAccess,
  isAmplifyAuthConfigured,
  signInAdmin,
  signOutAdmin,
  translateCognitoError
} from "@/lib/aws/auth";
import { configureAmplifyAuth } from "@/lib/aws/amplify-config";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configureAmplifyAuth();
    if (!isAmplifyAuthConfigured()) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(async (currentUser) => {
        setUser(currentUser);
        setGroups(await getUserGroups());
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
    try {
      const result = await signInAdmin(email, password);
      if (result.status === "newPasswordRequired") return result;
      setUser(result.user);
      setGroups(result.groups);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "admin-access-denied") {
        throw new Error("No tenés permisos para acceder al panel.");
      }
      throw new Error(translateCognitoError(error));
    }
  }

  async function completeNewPassword(newPassword: string) {
    try {
      const result = await completeNewPasswordChallenge(newPassword);
      setUser(result.user);
      setGroups(result.groups);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message === "admin-access-denied") {
        throw new Error("No tenés permisos para acceder al panel.");
      }
      throw new Error(translateCognitoError(error));
    }
  }

  async function logout() {
    await signOutAdmin();
    setUser(null);
    setGroups([]);
  }

  return {
    user,
    groups,
    loading,
    login,
    logout,
    completeNewPassword,
    configured: isAmplifyAuthConfigured(),
    hasAccess: hasAdminAccess(groups)
  };
}
