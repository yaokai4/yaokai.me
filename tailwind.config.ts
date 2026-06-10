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
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "PingFang SC",
          "Hiragino Sans",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans CJK SC",
          "Noto Sans SC",
          "WenQuanYi Micro Hei",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol"
        ],
        serif: [
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "Songti SC",
          "Noto Serif JP",
          "Noto Serif SC",
          "Georgia",
          "serif"
        ]
      },
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
        danger: "hsl(var(--danger))",
        // 简历同源色板:藏青(覆盖 indigo)+ 钢青(覆盖 sky),全站统一编辑风
        indigo: {
          50: "#F3F6FA",
          100: "#E7EEF5",
          200: "#C9D6E2",
          300: "#9FB6CB",
          400: "#6E8FAC",
          500: "#4A7095",
          600: "#2E5578",
          700: "#1D4263",
          800: "#14365D",
          900: "#0F2D4E",
          950: "#0A1F36"
        },
        sky: {
          50: "#F1F6FA",
          100: "#E2EDF5",
          200: "#C4DAEA",
          300: "#97BCD9",
          400: "#6699C2",
          500: "#3D6691",
          600: "#335780",
          700: "#29476B",
          800: "#1F3A57",
          900: "#16293D",
          950: "#0E1C2B"
        }
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
