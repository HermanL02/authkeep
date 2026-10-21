import type { NextRequest } from "next/server";
import { callApi, isAuthed, unauthorized } from "@/lib/api";

export async function GET(request: NextRequest) {
  if (!(await isAuthed(request))) return unauthorized();
  return callApi("/totp/codes");
}
