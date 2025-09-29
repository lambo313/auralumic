const config = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {
      // Add future-proof color support
      features: {
        'color-functional-notation': true,
        'oklch': true
      }
    }
  }
};

export default config;
