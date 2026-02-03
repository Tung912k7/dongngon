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
      keyframes: {
        'subtle-zoom': {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1.15)' },
        }
      },
      animation: {
        'subtle-zoom': 'subtle-zoom 20s ease-in-out infinite alternate',
      },
      fontFamily: {
        sans: ["var(--font-aria)", "sans-serif"],
        serif: ["var(--font-aria)", "serif"],
        roboto: ["var(--font-aria)", "sans-serif"],
        aquus: ["var(--font-aquus)", "serif"],
        aria: ["var(--font-aria)", "sans-serif"],
        "be-vietnam": ["var(--font-be-vietnam-next)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
