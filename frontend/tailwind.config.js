/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: "#090D16", // Premium dark slate background
        darkCard: "#121824", // Premium glassmorphism card background
        darkCardHover: "#182030",
        darkBorder: "rgba(255, 255, 255, 0.08)",
        brandPrimary: "#6366F1", // Indigo
        brandSecondary: "#8B5CF6", // Violet
        brandAccent: "#EC4899", // Pink (accent)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 20px rgba(99, 102, 241, 0.2)",
      },
    },
  },
  plugins: [],
}
