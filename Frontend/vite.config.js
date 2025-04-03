import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // Add this proxy configuration
    proxy: {
      // String shorthand: '/api' -> 'http://localhost:5000/api'
      // '/api': 'http://localhost:5000', // Basic proxy

      // More robust configuration:
      '/api': {
        target: 'http://localhost:5000/api', // <-- CHANGE TO YOUR BACKEND URL/PORT
        changeOrigin: true, // Recommended for virtual hosted sites
        // Optional: You might not need rewrite if backend already expects /api prefix
        // rewrite: (path) => path.replace(/^\/api/, ''), // Use if backend doesn't expect /api
      },
    },
    // Ensure your dev server port doesn't clash with backend
    port: 5173, // Or your preferred frontend port
  },
})
