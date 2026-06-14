/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        cream: {
          50: "#FDFCFA",
          100: "#FAF7F2",
          200: "#F0EBE1",
          300: "#E8DFD0",
          400: "#D4C5B9",
          500: "#B8A898",
        },
        charcoal: {
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#A0A0A0",
          300: "#6B6B6B",
          400: "#4A4A4A",
          500: "#2D2D2D",
          600: "#1F1F1F",
          700: "#141414",
        },
        lavender: {
          50: "#F0EDFA",
          100: "#E0DAF5",
          200: "#C4B8E8",
          300: "#A898DB",
          400: "#8B7EC8",
          500: "#6F63B5",
          600: "#5A4FA0",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Noto Serif SC", "serif"],
        sans: ["DM Sans", "Noto Sans SC", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(45, 45, 45, 0.06)",
        card: "0 4px 20px rgba(45, 45, 45, 0.08)",
        hover: "0 8px 30px rgba(45, 45, 45, 0.12)",
      },
      borderRadius: {
        pill: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
