import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL_V = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(URL_V, KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}

export async function getSessionUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user == null) return null;
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
  return profile ? { ...profile, auth: user } : null;
}

export async function requireUser() {
  const u = await getSessionUser();
  if (u == null) throw new Error("UNAUTHENTICATED");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role === "admin") return u;
  throw new Error("FORBIDDEN");
}
