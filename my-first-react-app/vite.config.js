import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // same as '0.0.0.0'
    port: 5173,
    // allowedHosts: 'all' // optional if needed
  }
})