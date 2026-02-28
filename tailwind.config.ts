import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ashfall: {
          50: "#f8fafc",
          300: "#94a3b8",
          500: "#475569",
          700: "#334155",
          900: "#0f172a"
        }
      }
    }
  },
  plugins: []
};

export default config;

