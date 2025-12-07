import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProduction = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],

    // Remove console.logs in production
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },

    // Build optimizations
    build: {
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Manual chunking for better caching and smaller initial bundle
          manualChunks: {
            // Core vendor chunk
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],

            // Supabase chunk
            'vendor-supabase': ['@supabase/supabase-js'],

            // Charts (heavy dependency)
            'vendor-charts': ['recharts'],

            // UI libraries
            'vendor-ui': ['lucide-react', 'react-toastify'],

            // Admin portal (separate chunk)
            'admin': [
              './pages/AdminDashboardPageNew.tsx',
              './pages/AdminLoyaltySettingsPage.tsx',
            ],

            // Barber portal (separate chunk)
            'barber': [
              './pages/BarberDashboardPage.tsx',
              './pages/BarberAppointmentsPage.tsx',
              './pages/BarberProfilePage.tsx',
            ],
          },
        },
      },

      // Minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
    },

    define: {
      // API_KEY removed
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
