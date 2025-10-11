import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Check if we're building in Vercel
  const isVercel = process.env.VERCEL === '1'

  // Only load local env files if NOT in Vercel
  // In Vercel, use the dashboard-configured environment variables
  if (!isVercel) {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    loadEnv(mode, process.cwd(), '');
  } else {
    console.log('Building in Vercel - using dashboard environment variables')
  }

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
            'vendor-export': ['jspdf', 'exceljs', 'html2canvas'],
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
        'exceljs',
        'lucide-react',
        '@heroicons/react/24/outline',
        '@supabase/supabase-js'
      ]
    }
  }
})