import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  getExpectedSessionToken,
  isAuthConfigured,
} from "@/lib/auth-core";

const PUBLIC_PATHS = new Set(["/login"]);

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname.includes(".")
  );
}

export async function proxy(request: NextRequest) {
  if (!isAuthConfigured()) {
    return new NextResponse(
      "Login auth is not configured. Set AUTH_EMAIL, AUTH_PASSWORD, and AUTH_SECRET in .env.",
      { status: 500 },
    );
  }

  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expectedToken = await getExpectedSessionToken();
  const isAuthenticated =
    typeof sessionToken === "string" && sessionToken === expectedToken;

  if (PUBLIC_PATHS.has(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
