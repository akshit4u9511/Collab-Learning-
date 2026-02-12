import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // Add the 'server' property
    proxy: { // Add the 'proxy' property inside 'server'
      '/user': { // When your frontend requests start with /user (like /user/...)
        target: 'http://localhost:8000', // Forward them to your backend running on port 8000
        changeOrigin: true, // This is usually needed for proxying
        secure: false, // Set to true if your backend uses HTTPS, otherwise false
      },
      // Add other backend route prefixes you use, like /auth, /chat, etc.
       '/auth': {
         target: 'http://localhost:8000',
         changeOrigin: true,
         secure: false,
       },
       // Add other routes from your app.js here as needed:
       // '/chat': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
       // '/message': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
       // '/request': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
       // '/report': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
       // '/rating': { target: 'http://localhost:8000', changeOrigin: true, secure: false },
    },
    port: 5173, // This is your frontend dev server port
  },
});