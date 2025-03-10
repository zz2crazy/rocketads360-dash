import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ensure environment variables are loaded
  envDir: '.',
  // Add better error overlay
  server: {
    hmr: true,
    overlay: true
  }
});