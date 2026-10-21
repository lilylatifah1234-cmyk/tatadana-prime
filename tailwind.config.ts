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
        // Palet Primer: Biru Muda & Nuansa Biru Eksekutif (Swiss Private Banking & Neo-Fintech)
        tangerine: {
          50: "#F0F9FF",  // Ice Sky Blue (Sangat lembut & bersih)
          100: "#E0F2FE", // Soft Light Blue
          200: "#BAE6FD", // Radiant Cyan-Sky
          300: "#7DD3FC", // Vibrant Sky Blue
          400: "#38BDF8", // Electric Cerulean
          500: "#0284C7", // Signature Azure Blue (Aksen Utama Mewah)
          600: "#0369A1", // Deep Ocean Blue
          700: "#075985", // Sapphire Executive
          800: "#0C4A6E", // Navy Sovereign
          900: "#082F49", // Midnight Blue
          DEFAULT: "#0284C7",
          glow: "#38BDF8",
        },
        // Palet Olive: Nuansa Hijau Zaitun Mewah & Eksekutif (Mediterranean Olive Wealth)
        olive: {
          50: "#F7F8F2",   // Fresh Pale Olive Mist
          100: "#EDF0E1",  // Soft Olive Cream
          200: "#DBE2C4",  // Sage Olive Light
          300: "#C2CEA0",  // Pale Moss Olive
          400: "#9FB36F",  // Vibrant Olive Green
          500: "#7A923E",  // Classic Mediterranean Olive
          600: "#5D7328",  // Executive Olive (Deep & Luxurious)
          700: "#485A1D",  // Royal Forest Olive
          800: "#364315",  // Deep Military Olive
          900: "#242E0C",  // Dark Obsidian Olive
          950: "#141A06",  // Midnight Olive
          DEFAULT: "#5D7328",
          glow: "#9FB36F",
        },
        ivory: {
          50: "#F8FAFC",
          100: "#F0F7FF",
          200: "#E2E8F0",
          DEFAULT: "#F8FAFC",
        },
        surplus: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
          dark: "#047857",
        },
        deficit: {
          DEFAULT: "#E11D48",
          light: "#FFE4E6",
          dark: "#BE123C",
        },
        threshold: {
          DEFAULT: "#5D7328",
          light: "#EDF0E1",
          dark: "#485A1D",
        },
        slate: {
          950: "#0B0F19",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
      boxShadow: {
        "olive-glow": "0 0 25px -4px rgba(93, 115, 40, 0.4), 0 0 10px -2px rgba(159, 179, 111, 0.3)",
        "tangerine-glow": "0 0 25px -4px rgba(2, 132, 199, 0.45), 0 0 10px -2px rgba(56, 189, 248, 0.35)",
        "card-luxury": "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.02)",
      }
    },
  },
  plugins: [],
};

export default config;
