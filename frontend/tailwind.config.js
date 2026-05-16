/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wc: {
          red:    "#8A1538",
          gold:   "#EEBA30",
          dark:   "#0D0A0B",
          card:   "#16101A",
          border: "#2A1F2E",
          light:  "#F5F0FF",
        },
      },
      fontFamily: {
        display: ["'Arial Black'", "sans-serif"],
      },
      backgroundImage: {
        "stadium": "radial-gradient(ellipse at top, #1a0a1e 0%, #0D0A0B 60%)",
        "gold-shine": "linear-gradient(135deg, #EEBA30 0%, #f5d060 50%, #EEBA30 100%)",
        "wc-hero": "linear-gradient(135deg, #8A1538 0%, #4a0820 50%, #0D0A0B 100%)",
      },
      animation: {
        "slide-up":   "slideUp 0.4s ease-out",
        "fade-in":    "fadeIn 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        slideUp:   { "0%": { opacity:0, transform:"translateY(20px)" }, "100%": { opacity:1, transform:"translateY(0)" } },
        fadeIn:    { "0%": { opacity:0 }, "100%": { opacity:1 } },
        glowPulse: { "0%,100%": { boxShadow:"0 0 10px rgba(138,21,56,0.4)" }, "50%": { boxShadow:"0 0 30px rgba(138,21,56,0.8)" } },
        float:     { "0%,100%": { transform:"translateY(0)" }, "50%": { transform:"translateY(-6px)" } },
      },
      boxShadow: {
        "wc-red":  "0 4px 24px rgba(138,21,56,0.5)",
        "wc-gold": "0 4px 24px rgba(238,186,48,0.4)",
        "card":    "0 8px 32px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
