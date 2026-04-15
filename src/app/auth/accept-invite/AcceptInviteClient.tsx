"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles Supabase invite and password-reset email links.
 *
 * Supabase email links can arrive in three different shapes depending on the
 * project's auth flow / email template:
 *
 *   1. Implicit flow:    /auth/accept-invite#access_token=...&refresh_token=...
 *   2. PKCE code flow:   /auth/accept-invite?code=...
 *   3. Token-hash OTP:   /auth/accept-invite?token_hash=...&type=invite|recovery|signup
 *
 * The Supabase browser client auto-consumes (1). For (2) and (3) we have to
 * call exchangeCodeForSession / verifyOtp explicitly. Once any of them yields
 * a session, send the user to /auth/set-password to choose their password.
 */
export default function AcceptInviteClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function consumeTokens() {
      // (3) token_hash OTP — Supabase's newer email template default
      const tokenHash = params.get("token_hash");
      const type = params.get("type") as
        | "invite"
        | "recovery"
        | "signup"
        | "magiclink"
        | "email_change"
        | null;
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (cancelled) return;
        if (error) {
          setError(error.message);
          return;
        }
        router.replace("/auth/set-password");
        return;
      }

      // (2) PKCE code — set on the URL as ?code=...
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          setError(error.message);
          return;
        }
        router.replace("/auth/set-password");
        return;
      }

      // (1) Implicit flow — token is in the URL hash, the browser client
      // consumes it automatically. Wait for onAuthStateChange.
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        if (session) {
          subscription.unsubscribe();
          router.replace("/auth/set-password");
        } else if (event === "INITIAL_SESSION") {
          // No hash session and no query token — only redirect to login if
          // we're not in the middle of an explicit exchange.
          const hasQueryToken =
            params.get("code") || params.get("token_hash");
          if (!hasQueryToken) {
            subscription.unsubscribe();
            router.replace("/login");
          }
        }
      }
    );

    consumeTokens();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, params]);

  return (
    <main className="min-h-screen flex justify-center items-center bg-stone-100">
      {error ? (
        <div className="card max-w-sm p-6 text-center space-y-3">
          <h1 className="text-lg font-semibold text-stone-800">
            Invite link couldn&apos;t be verified
          </h1>
          <p className="text-sm text-stone-600">{error}</p>
          <p className="text-xs text-stone-500">
            Ask your admin to send a fresh invite — these links expire after a
            short time and can only be used once.
          </p>
        </div>
      ) : (
        <p className="text-stone-500 text-sm">Setting up your account…</p>
      )}
    </main>
  );
}
