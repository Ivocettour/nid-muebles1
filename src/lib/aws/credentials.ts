import type { AwsCredentialIdentity } from "@aws-sdk/types";

export function getAwsRegion() {
  return process.env.NEXT_PUBLIC_AWS_REGION ?? "us-east-1";
}

export function getRuntimeCredentials(): AwsCredentialIdentity | undefined {
  const accessKeyId = process.env.NID_AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.NID_AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.NID_AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) return undefined;

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken
  };
}
