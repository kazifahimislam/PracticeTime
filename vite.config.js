import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow all IP addresses to access the development server
    port: 3000, // Optional: You can change the port if needed
  },
})
