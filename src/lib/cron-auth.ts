import type { NextRequest } from "next/server";

export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel cron sets Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  // Fallback: ?secret= for manual triggers
  if (req.nextUrl.searchParams.get("secret") === secret) return true;
  return false;
}
