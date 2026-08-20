/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "600px",   // Mobile → Tablet
      md: "900px",   // Tablet → Small Desktop
      lg: "1200px",  // Small Desktop → Large Desktop
    },
    fontFamily: {
      sans: ['"Kanit"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      display: ['"Kanit"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      caption: ['12px', { lineHeight: '16px' }],
      small: ['14px', { lineHeight: '18px' }],
      body: ['17px', { lineHeight: '25px' }],
      subheading: ['24px', { lineHeight: '24px' }],
      h3: ['28px', { lineHeight: '32px' }],
      h2: ['34px', { lineHeight: '50px' }],
      display: ['40px', { lineHeight: '44px' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      primary: {
        DEFAULT: '#0071e3',
        hover: '#006edb',
        active: '#0076df',
        focus: '#0077ed',
      },
      neutral: {
        50: '#f5f5f7',
        100: '#ededf2',
        200: '#d2d2d7',
        300: '#6e6e73',
        400: '#333336',
        500: '#272729',
        600: '#1d1d1f',
        700: '#18181a',
        900: '#000000',
      },
      danger: {
        DEFAULT: '#d70015',
        light: '#ffeaed',
      },
      success: {
        DEFAULT: '#248a3d',
        light: '#e8f8ee',
      },
      warning: {
        DEFAULT: '#bf5a00',
        light: '#fff3e0',
      },
      info: {
        DEFAULT: '#0071e3',
        light: '#e8f4fd',
      },
    },
    borderRadius: {
      none: '0px',
      DEFAULT: '8px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      raised: '0 2px 8px rgba(0, 0, 0, 0.08)',
      floating: '0 8px 24px rgba(0, 0, 0, 0.12)',
      modal: '0 16px 48px rgba(0, 0, 0, 0.16)',
      supreme: '0 24px 64px rgba(0, 0, 0, 0.20)',
      'focus-ring': '0 0 0 3px rgba(0, 113, 227, 0.3)',
      'focus-input': '0 0 0 3px rgba(0, 113, 227, 0.1)',
    },
    extend: {
      spacing: {
        '11': '44px',
        '13': '52px',
        '14': '56px',
      },
      width: {
        sidebar: '260px',
        column: '300px',
      },
      minHeight: {
        touch: '44px',
        btn: '36px',
      },
      opacity: {
        high: '0.80',
        medium: '0.56',
        low: '0.36',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
      },
      backdropBlur: {
        nav: '8px',
      },
      zIndex: {
        dropdown: '100',
        modal: '9998',
        'modal-content': '9999',
        toast: '10000',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 250ms ease-out',
      },
    },
  },
  plugins: [],
};
