import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (authed) return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except the login page, the login endpoint, health and static assets.
  matcher: ["/((?!login|api/session|api/health|_next/static|_next/image|favicon.ico).*)"],
};
