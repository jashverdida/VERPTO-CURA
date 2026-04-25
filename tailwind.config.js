/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Corporate white & green palette
        'brand-white': '#ffffff',
        'brand-light': '#f8f9fa',
        'brand-green': '#059669',
        'brand-green-dark': '#065f46',
        'brand-green-light': '#d1fae5',

        // Primary brand colors
        'clinical-blue': '#2563eb',
        'critical-red': '#dc2626',
        'warning-amber': '#f59e0b',
        'success-green': '#16a34a',

        // Neutral palette for backgrounds
        'surface-light': '#f8f9fa',
        'surface-white': '#ffffff',
        'text-dark': '#1f2937',
        'text-medium': '#6b7280',
        'text-light': '#9ca3af',

        // Status colors
        'status-active': '#3b82f6',
        'status-pending': '#f59e0b',
        'status-resolved': '#16a34a',
        'status-critical': '#dc2626',

        // Sidebar colors
        'sidebar-dark': '#1e293b',
        'sidebar-hover': '#334155',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        roboto: ['Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'enterprise': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}