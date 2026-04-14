import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  redirect("/time-cards");
}
