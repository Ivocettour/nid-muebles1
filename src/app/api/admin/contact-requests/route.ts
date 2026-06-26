import { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { listContactRequests } from "@/services/server/contactRequestRepository";

export async function GET(request: NextRequest) {
  try {
    await verifyCognitoRequest(request);
    const contactRequests = await listContactRequests();
    return jsonOk({ contactRequests });
  } catch (error) {
    return handleApiError(error);
  }
}
