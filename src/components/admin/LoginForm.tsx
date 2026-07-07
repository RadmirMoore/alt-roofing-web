import { useState, type FormEvent } from "react";
import { loginAdmin } from "../../lib/admin-api";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginAdmin(password);
      onSuccess();
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
      >
        <div className="mb-2 text-xs uppercase tracking-[0.25em] text-foreground/50">
          ALT Roofing Admin
        </div>
        <h1 className="font-display text-3xl font-bold">Admin login</h1>
        <p className="mt-3 text-sm text-foreground/65">
          Enter your admin password to view analytics, leads, and chat logs.
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Admin password"
          className="mt-6 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
        />
        {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
