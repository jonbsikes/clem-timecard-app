import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3B6FB8",
          dark: "#2A5490",
          light: "#6B93D0",
          50: "#F1F6FC",
          100: "#DCE8F6",
          200: "#B9D1ED",
          300: "#8FB3DE",
          600: "#3B6FB8",
          700: "#2A5490",
          800: "#1F3F6D",
          900: "#16304F",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
