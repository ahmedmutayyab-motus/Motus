/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#0F0F11',
          800: '#161619',
          700: '#1E1E22',
        },
        charcoal: {
          900: '#1A1A1D',
          800: '#2A2A2E',
        },
        copper: {
          500: '#C07C5B',
          600: '#AB6E51',
        },
        amber: {
          500: '#E4A853',
        },
        brand: {
          background: '#0a0a0b',
          foreground: '#FAFAFA',
          muted: '#8E8E93',
          border: '#27272A',
          primary: '#C07C5B', // Copper
          primaryHover: '#AB6E51',
          accent: '#E4A853', // Amber
          card: '#161619', // Obsidian 800
        }
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28, 44%, 55%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189, 100%, 56%, 0) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(28, 44%, 55%, 0) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
