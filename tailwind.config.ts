import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brandNavy: '#003080',
        brandDeepNavy: '#172B4D',
        brandGrowthGreen: '#287A3D',
        brandBrightGreen: '#50B040',
        brandBgSoft: 'var(--brand-bg-soft)',
        brandBorder: 'var(--brand-border)',
        brandText: 'var(--brand-text)',
        brandMuted: 'var(--brand-muted)',
        // Retain original for safety
        brand: {
          50: '#eef9ff',
          100: '#d9f1ff',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e'
        },
      },
      borderRadius: {
        '2xl': '0.625rem',
        '3xl': '0.75rem',
        '4xl': '0.875rem',
      },
      fontWeight: { extrabold: '700', black: '700' },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.03)',
        cardHover: '0 1px 4px rgb(15 23 42 / 0.06)',
        elevated: '0 1px 3px rgb(15 23 42 / 0.04)',
        soft: '0 1px 3px rgb(15 23 42 / 0.04)',
      },
      fontSize: {
        display: ['clamp(2.75rem, 5vw, 3.5rem)', { lineHeight: '1.04', letterSpacing: '-0.04em' }],
        hero: ['clamp(3rem, 7vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.045em' }],
        'fluid-2xl': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.25' }],
        'fluid-3xl': ['clamp(1.5rem, 3vw, 1.875rem)', { lineHeight: '1.2' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      screens: {
        '3xs': '360px',
      },
      maxWidth: {
        reading: '44rem',
      },
      minHeight: {
        tap: '2.75rem',
      },
    },
  },
  plugins: [],
};
export default config;

