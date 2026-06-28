/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    '#0A0F1E',
        'navy-light': '#111827',
        'navy-card':  'rgba(255,255,255,0.05)',
        gblu:    '#4285F4',
        gred:    '#EA4335',
        gyel:    '#FBBC04',
        ggrn:    '#34A853',
        gpurp:   '#8B5CF6',
        glass:   'rgba(255,255,255,0.05)'
      },
      fontFamily: {
        sans:  ['"Google Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace']
      },
      backdropBlur: { glass: '16px' },
      boxShadow: {
        glow:       '0 0 20px rgba(66,133,244,0.4)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.4)',
        'glow-green':  '0 0 20px rgba(52,168,83,0.4)',
        'glow-red':    '0 0 20px rgba(234,67,53,0.4)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'blob-morph': 'blobMorph 8s ease-in-out infinite',
        'gradient':   'gradientShift 4s ease infinite'
      }
    }
  },
  plugins: []
};