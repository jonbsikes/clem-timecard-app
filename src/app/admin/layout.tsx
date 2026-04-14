import { redirect } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/time-cards");

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="space-y-1 text-sm">
          <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Admin</p>
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-stone-200">Dashboard</Link>
          <Link href="/admin/projects" className="block px-3 py-2 rounded hover:bg-stone-200">Projects</Link>
          <Link href="/admin/employees" className="block px-3 py-2 rounded hover:bg-stone-200">Employees</Link>
          <Link href="/admin/equipment" className="block px-3 py-2 rounded hover:bg-stone-200">Equipment</Link>
          <Link href="/admin/work-types" className="block px-3 py-2 rounded hover:bg-stone-200">Work Types</Link>
          <Link href="/admin/settings" className="block px-3 py-2 rounded hover:bg-stone-200">Settings</Link>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
