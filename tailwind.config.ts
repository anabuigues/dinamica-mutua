import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            dark: '#003087',
            mid: '#0050B3',
            light: '#1A6FD4',
          },
          pink: '#E8005A',
          'pink-hover': '#C40050',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          400: '#ADB5BD',
          600: '#6C757D',
          800: '#343A40',
          900: '#212529',
        },
        semantic: {
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'display-md': ['17px', { lineHeight: '1.3', fontWeight: '600' }],
        'display-base': ['15px', { lineHeight: '1.5', fontWeight: '400' }],
        'display-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'display-xs': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.12)',
        lg: '0 8px 24px rgba(0,0,0,0.16)',
        sticky: '0 2px 8px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}

export default config
