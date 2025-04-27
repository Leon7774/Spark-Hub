import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: "class", // or 'media' if you want
  theme: {
    extend: {
      colors: {
        "background-1": "var(--background-1)",
        // Add other custom colors if needed
      },
    },
  },
  plugins: [animate],
};

export default config;
