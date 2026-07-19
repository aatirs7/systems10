"use client";

import { useRouter } from "next/navigation";
import { IconLogout } from "@/components/icons";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn-ghost w-full">
      <IconLogout width={15} height={15} />
      Sign out
    </button>
  );
}
