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
        black: "#07000B", // Natural Black
        white: "#F5F5F5", // White Smoke
        "literary-black": "#171717",
        paper: "#FAFAFA",
        "muted-ink": "#525252",
        "literary-gold": "#D4AF37",
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
        quicksand: ["var(--font-quicksand)", "sans-serif"],
        "be-vietnam": ["var(--font-be-vietnam-next)", "sans-serif"],
        serif: ["Lora", "Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
// Force rebuild 2026-03-01
