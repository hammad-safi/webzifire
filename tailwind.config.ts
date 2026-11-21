import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "canvas-dark": "#070405",
        "surface-card": "rgba(18, 10, 12, 0.75)",
        "surface-elevated": "rgba(28, 15, 18, 0.85)",
        surface: "rgba(18, 10, 12, 0.75)",
        "surface-dim": "#070405",
        "surface-bright": "rgba(35, 18, 22, 0.9)",
        "surface-container-lowest": "#050203",
        "surface-container-low": "#0A0507",
        "surface-container": "rgba(18, 10, 12, 0.75)",
        "surface-container-high": "rgba(28, 15, 18, 0.85)",
        "surface-container-highest": "rgba(38, 20, 24, 0.95)",
        "on-surface": "#FAF7F2",
        "on-surface-variant": "#D6CEC5",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-warm": "rgba(255, 255, 255, 0.08)",
        "border-hover": "rgba(224, 50, 75, 0.45)",
        "coral-glow": "rgba(224, 50, 75, 0.3)",
        "text-primary": "#FAF7F2",
        "text-secondary": "#D6CEC5",
        "text-muted": "#9E9589",
        "text-ivory": "#FAF7F2",
        "text-champagne": "#D6CEC5",
        primary: "#ffb3ae",
        "primary-container": "#E0324B",
        "primary-coral": "#E0324B",
        "on-primary": "#68000b",
        secondary: "#b9c8de",
        tertiary: "#c3c6d8",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "space-2xl": "4rem",
        "space-3xl": "6rem",
        margin: "4rem",
        "margin-tablet": "2rem",
        "margin-mobile": "1.25rem",
        gutter: "1.5rem",
        "gutter-mobile": "1rem",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter Tight", "Inter", "sans-serif"],
        headline: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "coral-sm": "0 0 16px rgba(255, 77, 77, 0.25)",
        "coral-md": "0 0 28px rgba(255, 77, 77, 0.4)",
        "coral-lg": "0 0 40px rgba(255, 77, 77, 0.6)",
        "elevated-card": "0 20px 40px -15px rgba(0, 0, 0, 0.6)",
      },
      keyframes: {
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "border-beam": "border-beam var(--duration, 8s) infinite linear",
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
