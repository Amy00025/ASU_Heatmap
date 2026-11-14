import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        asu: {
          maroon: "#8C1D40",
          "maroon-dark": "#5C132A",
          "maroon-light": "#B8325C",
          "maroon-soft": "#FDF2F4",
          gold: "#FFC627",
          "gold-dark": "#E5B020",
          "gold-soft": "#FEF9C3",
          "gold-light": "#FEF08A",
          "gold-border": "#FDE047",
          purple: "#6B21A8",
          "purple-hover": "#581C87",
          "purple-light": "#7C3AED",
          "purple-soft": "#F5F3FF",
          "purple-border": "#E9D5FF",
        },
        bg: {
          main: "#F8F9FC",
          card: "#FFFFFF",
          hover: "#F1F5F9",
          active: "#EDE9FE",
        },
        border: {
          subtle: "#E2E8F0",
          muted: "#CBD5E1",
          purple: "#E9D5FF",
          maroon: "#FECDD3",
          gold: "#FDE047",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(107, 33, 168, 0.06), 0 1px 3px rgba(0, 0, 0, 0.05)",
        card: "0 4px 20px -2px rgba(107, 33, 168, 0.08)",
        gold: "0 4px 18px rgba(255, 198, 39, 0.35)",
        hover: "0 10px 25px -5px rgba(140, 29, 64, 0.12), 0 8px 10px -6px rgba(255, 198, 39, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
