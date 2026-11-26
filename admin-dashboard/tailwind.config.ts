import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
        },
        brand: {
          blue: '#2563EB',
          sky: '#38BDF8',
          accent: '#1D4ED8',
        },
        status: {
          present: '#10B981', // Green
          absent: '#EF4444',  // Red
          halfday: '#F59E0B', // Yellow
          weeklyoff: '#0284C7', // Blue
          holiday: '#8B5CF6', // Purple
          leave: '#F97316',   // Orange
        }
      },
    },
  },
  plugins: [],
};
export default config;
