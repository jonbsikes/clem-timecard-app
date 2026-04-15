import { redirect } from "next/navigation";
import TopNav from "@/components/TopNav";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/time-cards");

  return (
    <div className="min-h-screen">
      <TopNav isAdmin={true} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
