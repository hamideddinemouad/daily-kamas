export const AUTH_COOKIE_NAME = "daily-kamas-session";

function getAuthConfig() {
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!email || !password || !secret) {
    return null;
  }

  return { email, password, secret };
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function isAuthConfigured() {
  return getAuthConfig() !== null;
}

export function validateLoginCredentials(email: string, password: string) {
  const config = getAuthConfig();

  if (!config) {
    return false;
  }

  return email === config.email && password === config.password;
}

export async function getExpectedSessionToken() {
  const config = getAuthConfig();

  if (!config) {
    throw new Error("Auth configuration is missing.");
  }

  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(config.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(`${config.email}:${config.password}`),
  );

  return toBase64Url(new Uint8Array(signature));
}
