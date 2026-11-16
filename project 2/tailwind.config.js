/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080D18',
        panel: '#101827',
        elevated: '#151F30',
        input: '#0C1320',
        cyan: {
          DEFAULT: '#39D9FF',
          dim: 'rgba(57, 217, 255, 0.15)',
        },
        radar: {
          DEFAULT: '#42E8A5',
          dim: 'rgba(66, 232, 165, 0.15)',
        },
        amber: {
          DEFAULT: '#FFB547',
          dim: 'rgba(255, 181, 71, 0.15)',
        },
        critical: {
          DEFAULT: '#FF5D6C',
          dim: 'rgba(255, 93, 108, 0.15)',
        },
        primary: '#F3F7FC',
        muted: '#9AA9BD',
        faint: '#5C6B82',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        subtle: 'rgba(148, 163, 184, 0.16)',
        default: 'rgba(148, 163, 184, 0.24)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        panel: '0 2px 8px rgba(0, 0, 0, 0.3)',
        elevated: '0 4px 16px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(57, 217, 255, 0.15)',
      },
    },
  },
  plugins: [],
};
