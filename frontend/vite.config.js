import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      overlay: true,
      clientPort: 5173,
    },
  },
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify CSS
    cssMinify: 'esbuild',
    // Generate sourcemaps for debugging (can disable in production)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime - cached across all pages
          'vendor-react': ['react', 'react-dom'],

          // Charting libraries - loaded only when charts are needed
          'vendor-charts': ['recharts', 'lightweight-charts'],

          // PDF generation - loaded only when exporting
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],

          // Internationalization - loaded on first render
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],

          // Icons - used across the app
          'vendor-icons': ['lucide-react'],

          // Markdown parsing - loaded only when AI Analyst is used
          'vendor-markdown': ['react-markdown'],
        },
      },
    },
    // Reduced warning limit now that we're properly splitting
    chunkSizeWarningLimit: 550,
  },
  // Test configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
