import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isAuthConfigured, isAuthenticated } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  if (await isAuthenticated()) {
    redirect(typeof next === "string" && next.startsWith("/") ? next : "/");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4efe4_0%,#f8f5ef_38%,#f1ebdf_100%)] px-4 py-8 text-stone-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/90 shadow-[0_24px_80px_-40px_rgba(68,46,20,0.45)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[linear-gradient(135deg,#1c1917_0%,#3f2b12_55%,#b45309_100%)] p-8 text-stone-50 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Daily Kamas
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sign in to access your revenue dashboard.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-amber-50/80 sm:text-base">
              This tracker is restricted to one account. Use the configured email
              and password to reach the dashboard and manage entries.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <h2 className="text-2xl font-semibold text-stone-950">Login</h2>
              <p className="mt-2 text-sm text-stone-600">
                Enter your email and password to continue.
              </p>

              {!isAuthConfigured() ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Login is not configured. Add `AUTH_EMAIL`, `AUTH_PASSWORD`, and
                  `AUTH_SECRET` in your `.env`.
                </div>
              ) : (
                <div className="mt-6">
                  <LoginForm
                    nextPath={
                      typeof next === "string" && next.startsWith("/")
                        ? next
                        : "/"
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
