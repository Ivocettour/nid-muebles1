import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { handleApiError, jsonError, jsonOk } from "@/lib/api/response";
import { contactSchema } from "@/lib/validations/contact";
import { createContactRequestItem } from "@/services/server/contactRequestRepository";

function sanitize(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (!checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) return jsonError("Demasiados intentos. Probá nuevamente más tarde.", 429);

    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return jsonError("Datos inválidos.", 422);
    if (parsed.data.company) return jsonOk({ ok: true });

    const now = new Date().toISOString();
    await createContactRequestItem({
      id: randomUUID(),
      fullName: sanitize(parsed.data.fullName),
      phone: sanitize(parsed.data.phone),
      email: sanitize(parsed.data.email),
      city: sanitize(parsed.data.city),
      environment: sanitize(parsed.data.environment),
      furnitureType: sanitize(parsed.data.furnitureType),
      approximateDimensions: parsed.data.approximateDimensions ? sanitize(parsed.data.approximateDimensions) : undefined,
      estimatedBudget: parsed.data.estimatedBudget ? sanitize(parsed.data.estimatedBudget) : undefined,
      description: sanitize(parsed.data.description),
      referenceImages: [],
      preferredContactMethod: parsed.data.preferredContactMethod,
      status: "new",
      createdAt: now,
      updatedAt: now
    });
    return jsonOk({ ok: true }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
