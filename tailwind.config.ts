import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1034A6", // Egyptian blue
          dark: "#0A2470",
          light: "#2E57C9",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
