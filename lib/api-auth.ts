import { AUTH_COOKIE_NAME, getExpectedSessionToken, isAuthConfigured } from "@/lib/auth-core";

export async function isAuthenticatedRequest(request: Request) {
  if (!isAuthConfigured()) {
    return false;
  }

  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return false;
  }

  const sessionToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.slice(AUTH_COOKIE_NAME.length + 1);

  if (!sessionToken) {
    return false;
  }

  return sessionToken === (await getExpectedSessionToken());
}
