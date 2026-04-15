import Link from "next/link";
import {
  IconUser,
  IconBuilding,
  IconDocs,
  IconProjects,
  IconHammer,
  IconTruck,
  IconPeople,
  IconGear,
} from "@/components/Icons";

export const dynamic = "force-dynamic";

const TILES = [
  { href: "/time-cards", label: "My Time", Icon: IconUser },
  { href: "/admin/company-time", label: "Company Time", Icon: IconBuilding },
  { href: "/admin/documents", label: "Documents", Icon: IconDocs },
  { href: "/admin/projects", label: "Projects", Icon: IconProjects },
  { href: "/admin/work-types", label: "Work Types", Icon: IconHammer },
  { href: "/admin/equipment", label: "Equipment", Icon: IconTruck },
  { href: "/admin/employees", label: "Employees", Icon: IconPeople },
  { href: "/admin/settings", label: "Settings", Icon: IconGear },
];

export default function AdminHub() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">Pick a section to manage.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {TILES.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="icon-tile group">
            <Icon size={36} className="text-brand group-hover:text-brand-dark" />
            <span className="icon-tile-label">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
