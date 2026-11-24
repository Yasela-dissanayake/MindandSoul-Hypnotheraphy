import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand palette (docs/Colour Palette Document.docx): Deep Green #0E2A16 leads, Gold #D9B45A is an accent,
        // Cream #F6F1E3 for light backgrounds, Sage Green #9FA88A for soft supporting tones.
        brand: {
          green: "#0E2A16",
          gold: "#D9B45A",
          cream: "#F6F1E3",
          sage: "#9FA88A",
        },
        // The site's main green scale: light tints from the brand Sage, dark shades towards the brand Deep Green.
        // 600 = buttons, 700 = links and the Deep Green itself.
        sage: {
          50: "#f5f6ef",
          100: "#e9ecdf",
          200: "#d5dac6",
          300: "#b9c0a6",
          400: "#9fa88a",
          500: "#4f6f53",
          600: "#1f4529",
          700: "#0e2a16",
          800: "#0b2312",
          900: "#071a0d",
        },
        // Gold accents. 300-500 for lines, icons and details on dark green; 600-800 for gold text on light backgrounds (readable).
        gold: {
          50: "#fbf7ea",
          100: "#f5ecd0",
          200: "#ecdcaa",
          300: "#e3c87f",
          400: "#d9b45a",
          500: "#c49a3c",
          600: "#a47d2c",
          700: "#7f6024",
          800: "#5f4820",
          900: "#4a391c",
        },
        cream: {
          DEFAULT: "#f6f1e3",
          50: "#fcfaf4",
          100: "#f6f1e3",
          200: "#ece3cb",
        },
        // Warm neutrals; the lightest shades lean towards the brand Cream so pages feel soft rather than stark white.
        stone: {
          50: "#faf8f2",
          100: "#f3efe4",
          200: "#e6e1d4",
          300: "#d3cdbf",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        serif: ["Georgia", "serif"],
        // The logo's typeface (Poppins), for the "Mind & Soul Works" wordmark.
        brand: ["var(--font-brand)", "Poppins", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
