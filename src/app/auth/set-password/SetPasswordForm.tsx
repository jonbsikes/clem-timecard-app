"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Failed to set password.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex justify-center items-start sm:items-center pt-10 sm:pt-0 px-6 pb-6 bg-stone-100">
      <div className="card w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center mb-4">
          <Image
            src="/new-clem-logo.png"
            alt="Clem Excavation & Land Services LLC"
            width={320}
            height={320}
            priority
            className="w-64 h-auto max-w-full"
          />
        </div>
        <h1 className="text-lg font-semibold text-stone-800 mb-1 text-center">Set your password</h1>
        <p className="text-sm text-stone-500 text-center mb-5">Choose a password to finish setting up your account.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              className="input"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Saving…" : "Set password & sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
