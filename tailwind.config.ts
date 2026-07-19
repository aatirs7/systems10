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
        ink: "#08090B",
        panel: "#101215",
        "panel-2": "#151A1E",
        line: "rgba(255,255,255,0.07)",
        "line-2": "rgba(255,255,255,0.12)",
        fog: "#E7EAEC",
        muted: "#969CA2",
        faint: "#666C72",
        acid: "#C9F24A",
        "acid-dim": "#A6CC3B",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(201,242,74,0.35), 0 8px 30px -8px rgba(201,242,74,0.25)",
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
