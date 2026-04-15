import Link from "next/link";
import Image from "next/image";
import { getSessionUser } from "@/lib/supabase/server";

export default async function TopNav() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";
  return (
    <header className="bg-brand text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Image
            src="/clem.logo.jpg"
            alt="Clem Excavation and Land Services LLC"
            width={96}
            height={96}
            priority
            className="rounded-lg bg-white p-1 shrink-0 w-16 h-16 sm:w-20 sm:h-20 ring-2 ring-white/40"
          />
          <span className="font-bold leading-tight min-w-0">
            <span className="block text-base sm:text-xl truncate">
              Clem Excavation &amp; Land Services
            </span>
            <span className="block text-xs sm:text-sm font-medium opacity-90">
              Time Cards
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4 text-sm shrink-0">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline hover:underline font-medium"
            >
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="underline opacity-90 hover:opacity-100">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
