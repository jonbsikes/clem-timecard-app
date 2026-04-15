"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      if (mode === "password") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        setMsg("Check your email for the sign-in link.");
      }
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-stone-100">
      <div className="card w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/new-clem-logo.png"
            alt="Clem Excavation & Land Services LLC"
            width={180}
            height={180}
            priority
            className="rounded-xl"
          />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" inputMode="email"
                   required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode === "password" && (
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" autoComplete="current-password"
                     required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          {err && <p className="text-sm text-red-700">{err}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : mode === "password" ? "Sign in" : "Send magic link"}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-stone-600 underline"
          onClick={() => { setMode(mode === "password" ? "magic" : "password"); setErr(null); setMsg(null); }}
        >
          {mode === "password" ? "Use magic link instead" : "Use password instead"}
        </button>
      </div>
    </main>
  );
}
