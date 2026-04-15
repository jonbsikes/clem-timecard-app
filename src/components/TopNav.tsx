"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/time-cards": "Log History",
  "/time-cards/new": "New Time Card",
  "/time-cards/projects": "Documents",
  "/admin": "Admin Dashboard",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  isAdmin?: boolean;
};

export default function TopNav({ isAdmin = false }: Props) {
  const pathname = usePathname() ?? "";
  const title = getPageTitle(pathname);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" aria-label="Home">
            <Image
              src="/clem.logo.jpg"
              alt="Clem Excavation and Land Services LLC"
              width={96}
              height={96}
              priority
              className="rounded-lg shrink-0 w-12 h-12 sm:w-14 sm:h-14"
            />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold leading-tight text-slate-900 truncate">{title}</h1>
        </div>
        <nav className="flex items-center gap-3 sm:gap-4 text-sm shrink-0">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline hover:underline font-medium text-slate-700"
            >
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="underline text-slate-600 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
