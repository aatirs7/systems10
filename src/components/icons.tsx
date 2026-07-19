import type { SVGProps } from "react";

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconPipeline(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M3 6h18M3 12h18M3 18h18" />
      <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconReplies(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconUpload(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M12 3v13M7 8l5-5 5 5" />
    </svg>
  );
}

export function IconMark(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M13 2 4 14h7l-1 8 10-13h-7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSearch(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconArrowLeft(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconExternal(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function IconLogout(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconArrowRight(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
