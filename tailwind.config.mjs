/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0a',
          elevated: '#111111',
          card: '#141414',
        },
        text: {
          DEFAULT: '#e8e6e3',
          // 9a9590 — passes WCAG AA (6.6:1) — fixes v222's failing contrast
          muted: '#9a9590',
        },
        accent: {
          DEFAULT: '#ff3c78',
          dim: 'rgba(255, 60, 120, 0.08)',
          hover: '#ff1a60',
        },
        border: '#1e1e1e',
      },
      fontFamily: {
        body: ['"Instrument Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        '4': '4px',
        '5': '5px',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease forwards',
        'marquee': 'marquee 30s linear infinite',
        'scroll-pulse': 'scroll-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'scroll-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
