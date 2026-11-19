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
        "canvas-dark": "#0B0607",
        "surface-card": "#140A0C",
        "surface-elevated": "#1B0E10",
        surface: "#140A0C",
        "surface-dim": "#0B0607",
        "surface-bright": "#2C181B",
        "surface-container-lowest": "#070304",
        "surface-container-low": "#0E0708",
        "surface-container": "#140A0C",
        "surface-container-high": "#1B0E10",
        "surface-container-highest": "#241316",
        "on-surface": "#F5EFE6",
        "on-surface-variant": "#D8CFC2",
        "border-subtle": "rgba(255, 255, 255, 0.08)",
        "border-warm": "#2C181B",
        "border-hover": "rgba(214, 51, 74, 0.4)",
        "coral-glow": "rgba(214, 51, 74, 0.24)",
        "text-primary": "#F5EFE6",
        "text-secondary": "#D8CFC2",
        "text-muted": "#8A8175",
        "text-ivory": "#F5EFE6",
        "text-champagne": "#C4B5A5",
        primary: "#ffb3ae",
        "primary-container": "#D6334A",
        "primary-coral": "#D6334A",
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
