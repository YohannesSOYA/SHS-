const { defineConfig } = require('vite');

module.exports = defineConfig({
  plugins: [require('@vitejs/plugin-react')()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
