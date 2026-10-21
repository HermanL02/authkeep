import type { NextRequest } from "next/server";
import { callApi, isAuthed, unauthorized } from "@/lib/api";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed(request))) return unauthorized();
  const { id } = await params;
  return callApi(`/totp/accounts/${encodeURIComponent(id)}`, { method: "DELETE" });
}
