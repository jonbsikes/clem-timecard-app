import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B45309", // dirt/amber
          dark: "#78350F",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
