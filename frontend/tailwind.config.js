module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ... other extensions
    },
  },
  plugins: [
    // ... other plugins
    require('tailwind-scrollbar-hide')
  ],
}
