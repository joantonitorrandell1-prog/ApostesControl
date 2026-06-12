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
        background: 'hsl(224, 71%, 4%)', // Slate dark background
        card: 'hsl(224, 71%, 7%)',       // Premium slate card
        border: 'hsl(220, 20%, 15%)',
        accent: {
          green: '#10b981',             // Emerald green for wins
          red: '#f43f5e',               // Rose red for losses
          gold: '#f59e0b',              // Amber for pending/warnings
          cyan: '#06b6d4',              // Cyan for sports
          indigo: '#6366f1',            // Indigo for admin controls
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
