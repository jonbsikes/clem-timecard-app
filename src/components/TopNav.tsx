import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/supabase/server";

export default async function TopNav() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  return (
    <header className="bg-brand text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <Image
            src="/clem.logo.jpg"
            alt="Clem"
            width={36}
            height={36}
            priority
            className="rounded bg-white p-0.5"
          />
          <span>Clem Time Cards</span>
        </Link>
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
