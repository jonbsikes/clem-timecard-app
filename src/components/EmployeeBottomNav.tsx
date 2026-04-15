"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHistory, IconPlus, IconDocs, IconShield } from "./Icons";

type Props = {
  /** When the current viewer is an admin, surface an extra "Admin" tile that jumps back to the admin hub. */
  isAdmin?: boolean;
};

export default function EmployeeBottomNav({ isAdmin = false }: Props) {
  const pathname = usePathname() ?? "";

  type Item = {
    href: string;
    label: string;
    Icon: (p: any) => JSX.Element;
    primary?: boolean;
    active?: boolean;
  };

  const items: Item[] = [
    {
      href: "/time-cards",
      label: "Log History",
      Icon: IconHistory,
      active: pathname === "/time-cards",
    },
    {
      href: "/time-cards/new",
      label: "New Card",
      Icon: IconPlus,
      primary: true,
      active: pathname.endsWith("/new"),
    },
    {
      href: "/time-cards/projects",
      label: "Documents",
      Icon: IconDocs,
      active: pathname.includes("/projects"),
    },
  ];

  if (isAdmin) {
    items.push({
      href: "/admin",
      label: "Admin",
      Icon: IconShield,
      active: false,
    });
  }

  const cols =
    items.length === 3 ? "grid-cols-3" : items.length === 4 ? "grid-cols-4" : "grid-cols-5";

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      aria-label="Employee navigation"
    >
      <ul className={`max-w-xl mx-auto grid ${cols} items-end px-2`}>
        {items.map(({ href, label, Icon, primary, active }) => (
          <li key={label} className="flex justify-center">
            {primary ? (
              <Link
                href={href}
                className="flex flex-col items-center -mt-6"
                aria-label={label}
              >
                <span className="w-16 h-16 rounded-full bg-brand text-white shadow-lg flex items-center justify-center border-4 border-white">
                  <Icon size={30} />
                </span>
                <span className="text-[11px] font-semibold text-slate-700 mt-1">
                  {label}
                </span>
              </Link>
            ) : (
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-3 px-2 min-w-[72px] ${
                  active ? "text-brand" : "text-slate-600"
                }`}
              >
                <Icon size={26} />
                <span className="text-[11px] font-semibold leading-tight">
                  {label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
