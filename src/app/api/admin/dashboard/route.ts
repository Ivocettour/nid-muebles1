import { NextRequest } from "next/server";
import { handleApiError, jsonOk } from "@/lib/api/response";
import { verifyCognitoRequest } from "@/lib/auth/cognito";
import { getAdminDashboardData } from "@/services/server/adminDashboardRepository";

export async function GET(request: NextRequest) {
  try {
    await verifyCognitoRequest(request, ["Admin", "Editor"]);
    const data = await getAdminDashboardData();
    return jsonOk({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
