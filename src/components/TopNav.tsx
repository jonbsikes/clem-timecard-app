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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function prettify(segment: string): string {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segments = pathname.split("/").filter(Boolean);
  // Skip trailing UUIDs (detail pages) and fall back to the parent segment.
  while (segments.length && UUID_RE.test(segments[segments.length - 1])) {
    segments.pop();
  }
  const segment = segments[segments.length - 1] ?? "";
  return prettify(segment);
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
              src="/new-clem-logo.png"
              alt="Clem Excavation and Land Services LLC"
              width={160}
              height={160}
              priority
              className="shrink-0 h-14 w-14 sm:h-16 sm:w-16 object-contain"
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
