import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // All theme-aware via CSS variables (see globals.css :root / [data-theme]).
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-2": "rgb(var(--panel-2) / <alpha-value>)",
        fog: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        acid: "rgb(var(--accent) / <alpha-value>)",
        "acid-dim": "rgb(var(--accent-dim) / <alpha-value>)",
        invert: "rgb(var(--invert) / <alpha-value>)",
        "invert-fg": "rgb(var(--invert-fg) / <alpha-value>)",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgb(var(--fg) / 0.03) inset, 0 24px 48px -28px rgb(0 0 0 / 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
