import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Ensure VITE_ prefixed variables are exposed
    envPrefix: 'VITE_',

    // Server configuration
    server: {
      port: 5176,
      host: true,
      open: true,
    },

    // Build configuration for production
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['lucide-react', '@heroicons/react'],
            'vendor-export': ['jspdf', 'xlsx', 'html2canvas'],
            'vendor-store': ['zustand'],
          }
        }
      }
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'jspdf',
        'xlsx',
        'lucide-react',
        '@heroicons/react/24/outline',
        '@supabase/supabase-js'
      ]
    }
  }
})