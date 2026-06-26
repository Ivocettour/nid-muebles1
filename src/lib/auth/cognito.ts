import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { NextRequest } from "next/server";

export type AdminRole = "Admin" | "Editor";

export interface AuthContext {
  sub: string;
  email?: string;
  groups: AdminRole[];
  payload: JWTPayload;
}

const region = process.env.NEXT_PUBLIC_AWS_REGION;
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;

const jwks =
  region && userPoolId
    ? createRemoteJWKSet(new URL(`https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`))
    : null;

export function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export async function verifyCognitoRequest(request: NextRequest, allowedRoles: AdminRole[] = ["Admin", "Editor"]): Promise<AuthContext> {
  const token = getBearerToken(request);
  if (!token || !jwks || !region || !userPoolId || !clientId) {
    throw new Response("No autorizado", { status: 401 });
  }

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: clientId
  });

  const groups = ((payload["cognito:groups"] as string[] | undefined) ?? []).filter((group): group is AdminRole => group === "Admin" || group === "Editor");
  if (!groups.some((group) => allowedRoles.includes(group))) {
    throw new Response("Acceso denegado", { status: 403 });
  }

  return {
    sub: String(payload.sub),
    email: typeof payload.email === "string" ? payload.email : undefined,
    groups,
    payload
  };
}

export function canDelete(roleSet: AdminRole[]) {
  return roleSet.includes("Admin");
}
