import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bio: {
          deep: '#134647',
          darkest: '#040D0E',
          surface: '#071719',
          card: '#0D2628',
          teal: '#0D9488',
          emerald: '#10B981',
          lightTeal: '#14B8A6',
          mint: '#6EE7B7',
        },
        gold: {
          light: '#FEF08A',
          DEFAULT: '#FACC15',
          dark: '#F59E0B',
          glow: '#FDE047',
        },
        crimson: {
          DEFAULT: '#E11D48',
          dark: '#8B261D',
          light: '#FDA4AF',
        },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      animation: {
        'ecg-pulse': 'ecgPulse 2.4s ease-in-out infinite',
        'float-slow': 'floating 6s ease-in-out infinite',
        'float-delayed': 'floating 6s ease-in-out 3s infinite',
        'dna-spin': 'dnaSpin 20s linear infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'watermark': 'watermarkFloat 14s ease-in-out infinite alternate',
      },
      keyframes: {
        ecgPulse: {
          '0%, 100%': { strokeDashoffset: '1000' },
          '50%': { strokeDashoffset: '0' },
        },
        floating: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        dnaSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        watermarkFloat: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(calc(100% - 100px), calc(100% - 40px))' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
