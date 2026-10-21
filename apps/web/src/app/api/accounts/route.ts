import type { NextRequest } from "next/server";
import { callApi, isAuthed, unauthorized } from "@/lib/api";

export async function POST(request: NextRequest) {
  if (!(await isAuthed(request))) return unauthorized();
  return callApi("/totp/accounts", { method: "POST", body: await request.text() });
}
