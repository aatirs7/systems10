"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@/components/icons";

type Theme = "dark" | "light";

export function ThemeToggle({ variant = "full" }: { variant?: "full" | "icon" }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setTheme(t === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore storage errors
    }
    setTheme(next);
  }

  const Icon = theme === "dark" ? IconSun : IconMoon;
  const label = theme === "dark" ? "Light mode" : "Dark mode";

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        aria-label={label}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-2 bg-fog/[0.02] text-muted transition hover:text-fog"
      >
        <Icon width={16} height={16} />
      </button>
    );
  }

  return (
    <button onClick={toggle} className="btn-ghost w-full">
      <Icon width={15} height={15} />
      {label}
    </button>
  );
}
