"use server";

import { redirect } from "next/navigation";
import { clearAuthCookie, isAuthConfigured, setAuthCookie, validateLoginCredentials } from "@/lib/auth";

type LoginState = {
  error: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return {
      error: "Login is not configured. Add AUTH_EMAIL, AUTH_PASSWORD, and AUTH_SECRET in .env.",
    };
  }

  const email = formData.get("email");
  const password = formData.get("password");
  const nextPath = formData.get("next");

  if (typeof email !== "string" || email.trim() === "") {
    return { error: "Email is required." };
  }

  if (typeof password !== "string" || password.trim() === "") {
    return { error: "Password is required." };
  }

  if (!validateLoginCredentials(email.trim(), password)) {
    return { error: "Invalid email or password." };
  }

  await setAuthCookie();

  const safeNext =
    typeof nextPath === "string" && nextPath.startsWith("/") ? nextPath : "/";

  redirect(safeNext);
}

export async function logout() {
  await clearAuthCookie();
  redirect("/login");
}
