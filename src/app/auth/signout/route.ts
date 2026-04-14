import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Prefer explicit env var, then the request's own origin (works on Vercel),
  // and only fall back to localhost for local dev.
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  return NextResponse.redirect(new URL("/login", base));
}
