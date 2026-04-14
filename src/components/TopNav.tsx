import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";

export default async function TopNav() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  return (
    <header className="bg-brand text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">Clem Time Cards</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/time-cards" className="hover:underline">My Cards</Link>
          {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
          <form action="/auth/signout" method="post">
            <button className="underline opacity-90 hover:opacity-100">Sign out</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
