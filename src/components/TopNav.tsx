"use client";
import Link from "next/link";
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
    <header className="bg-brand text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-bold leading-tight">{title}</h1>
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
