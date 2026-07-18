import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Systems 10 Outbound</span>
            <nav className="flex items-center gap-4 text-sm text-neutral-600">
              <Link href="/pipeline" className="hover:text-neutral-900">
                Pipeline
              </Link>
              <Link href="/replies" className="hover:text-neutral-900">
                Replies
              </Link>
              <Link href="/upload" className="hover:text-neutral-900">
                Import CSV
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span>{session.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
