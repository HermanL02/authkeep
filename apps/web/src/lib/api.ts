import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./session";

// Server-side client for the Authkeep API. The API key never reaches the browser.
export async function callApi(path: string, init: RequestInit = {}): Promise<NextResponse> {
  const base = process.env.API_URL;
  const key = process.env.API_KEY;
  if (!base || !key) {
    return NextResponse.json({ message: "API_URL / API_KEY not configured" }, { status: 500 });
  }
  const res = await fetch(new URL(path, base), {
    ...init,
    headers: { "content-type": "application/json", "x-api-key": key, ...init.headers },
    cache: "no-store",
  });
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await res.json().catch(() => ({})), { status: res.status });
}

// Proxy only does an optimistic check; every handler verifies the session again.
export async function isAuthed(req: NextRequest): Promise<boolean> {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export const unauthorized = () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });
