import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        utt: {
          green: "#2F6B3D",
          "green-deep": "#23532E",
          gold: "#C9A227",
          "gold-soft": "#E8D27A",
          beige: "#FBF7EE",
          "beige-deep": "#F4ECD8",
          ink: "#1F1F1F",
        },
      },
      fontFamily: {
        serif: ["Georgia", '"Times New Roman"', "serif"],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        cert: "0 4px 22px rgba(0,0,0,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
