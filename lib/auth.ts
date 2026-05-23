import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  getExpectedSessionToken,
  isAuthConfigured,
  validateLoginCredentials,
} from "@/lib/auth-core";

export {
  AUTH_COOKIE_NAME,
  getExpectedSessionToken,
  isAuthConfigured,
  validateLoginCredentials,
};

const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;

export async function setAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, await getExpectedSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEN_YEARS_IN_SECONDS,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function isAuthenticated() {
  if (!isAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  return sessionToken === (await getExpectedSessionToken());
}
