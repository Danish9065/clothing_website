import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'translate-x-0',
    '-translate-x-full',
    'data-[open=true]:translate-x-0',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        }
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
      }
    }
  },
  plugins: [],
};
export default config;
