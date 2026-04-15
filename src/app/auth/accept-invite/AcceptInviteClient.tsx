"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles Supabase invite and password-reset email links.
 *
 * Supabase sends these as implicit-flow redirects — the session token arrives
 * in the URL hash (#access_token=...) rather than as a ?code= query param.
 * Hashes are never sent to the server, so the server-side callback route can't
 * process them. This client component lets the Supabase browser client detect
 * and consume the hash, then redirects the user to set their password.
 */
export default function AcceptInviteClient() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // The Supabase browser client automatically processes #access_token from the
    // URL hash during initialisation. onAuthStateChange fires once the session
    // is established (SIGNED_IN) or confirmed as absent (INITIAL_SESSION w/ no session).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          subscription.unsubscribe();
          router.replace("/auth/set-password");
        } else if (event === "INITIAL_SESSION") {
          // No session and no hash token — send to login.
          subscription.unsubscribe();
          router.replace("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex justify-center items-center bg-stone-100">
      <p className="text-stone-500 text-sm">Setting up your account…</p>
    </main>
  );
}
