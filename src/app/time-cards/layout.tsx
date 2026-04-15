import TopNav from "@/components/TopNav";
import EmployeeBottomNav from "@/components/EmployeeBottomNav";
import { getSessionUser } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen has-bottom-nav">
      <TopNav isAdmin={isAdmin} />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      <EmployeeBottomNav isAdmin={isAdmin} />
    </div>
  );
}
