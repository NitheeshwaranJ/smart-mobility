/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F1A",
        surface: "#111827",
        surface2: "#1A2233",
        border: "#1F2A40",
        text: "#E6EAF2",
        muted: "#8A93A6",
        primary: "#3B82F6",
        accent: "#22D3EE",
        success: "#10B981",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(59,130,246,.4), 0 8px 30px rgba(59,130,246,.15)",
        card: "0 1px 0 rgba(255,255,255,.04) inset, 0 10px 30px rgba(0,0,0,.35)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg,#3B82F6 0%,#22D3EE 100%)",
        "grad-hero": "radial-gradient(1200px 600px at 70% -10%, rgba(59,130,246,.25), transparent 60%), radial-gradient(900px 500px at 10% 20%, rgba(34,211,238,.18), transparent 60%)",
      },
    },
  },
  plugins: [],
};
