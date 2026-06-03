import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))"
      },
      boxShadow: {
        glow: "0 0 60px rgba(78, 168, 222, 0.18)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.32)"
      },
      backgroundImage: {
        "hero-mesh":
          "radial-gradient(circle at 20% 20%, rgba(78,168,222,.22), transparent 28%), radial-gradient(circle at 80% 0%, rgba(172,146,236,.18), transparent 26%), linear-gradient(135deg, rgba(9,11,20,1), rgba(17,24,39,1) 45%, rgba(3,7,18,1))"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        shimmer: "shimmer 9s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
