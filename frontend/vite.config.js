import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['react-bootstrap', 'bootstrap'],
          supabase: ['@supabase/supabase-js'],
          animations: ['framer-motion'],
          icons: ['@fortawesome/react-fontawesome', '@fortawesome/free-solid-svg-icons']
        }
      }
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true
  }
})
