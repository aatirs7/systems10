import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(brands)
    .where(eq(brands.status, "interested"));

  return (
    <div className="flex min-h-screen">
      <Sidebar email={session.email} interestedCount={count ?? 0} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-8 py-9">{children}</div>
      </main>
    </div>
  );
}
