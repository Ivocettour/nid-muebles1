import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f8f5ef",
        linen: "#ece3d4",
        stone: "#8a857c",
        graphite: "#1f211f",
        timber: "#a6784f",
        clay: "#c3a17e"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(31, 33, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
