"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMark, IconPipeline, IconReplies, IconUpload } from "@/components/icons";
import { LogoutButton } from "@/components/logout-button";

const NAV = [
  { href: "/pipeline", label: "Pipeline", Icon: IconPipeline },
  { href: "/replies", label: "Replies", Icon: IconReplies },
  { href: "/upload", label: "Import CSV", Icon: IconUpload },
];

export function Sidebar({
  email,
  interestedCount,
}: {
  email: string;
  interestedCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-panel/40 px-4 py-5 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-acid text-ink">
          <IconMark width={18} height={18} />
        </span>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-bold tracking-tight text-fog">Systems 10</div>
          <div className="kicker">Outbound</div>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/[0.06] font-medium text-fog"
                  : "text-muted hover:bg-white/[0.03] hover:text-fog"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  width={17}
                  height={17}
                  className={active ? "text-acid" : "text-faint group-hover:text-muted"}
                />
                {label}
              </span>
              {href === "/replies" && interestedCount > 0 && (
                <span className="rounded-full bg-acid/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-acid">
                  {interestedCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-line pt-4">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-black/40 font-mono text-xs font-semibold text-acid">
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted" title={email}>
            {email}
          </span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
