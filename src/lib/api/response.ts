import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Response) return error;
  console.error(JSON.stringify({ level: "error", message: error instanceof Error ? error.message : "Unknown API error" }));
  return jsonError("No se pudo completar la operación.", 500);
}
