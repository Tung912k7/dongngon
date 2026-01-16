import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["'Roboto'", "sans-serif"],
        mono: ["monospace"],
        serif: ["'Roboto'", "serif"],
        roboto: ["'Roboto'", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
