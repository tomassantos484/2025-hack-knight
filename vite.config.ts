import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      // Temporarily commenting out the lovable-tagger plugin to troubleshoot WebSocket issues
      // mode === 'development' &&
      // componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define env variables to expose to the client
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      // Increase the warning limit to avoid unnecessary warnings
      chunkSizeWarningLimit: 800,
      // Optimize the build
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
      // Configure code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor code into separate chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['framer-motion', '@clerk/clerk-react', 'lucide-react'],
            'vendor-utils': ['@tanstack/react-query', 'sonner', 'date-fns'],
            // Split app code by feature
            'feature-dashboard': [
              './src/components/DashboardLayout.tsx',
              './src/components/dashboard/DashboardHeader.tsx',
              './src/components/dashboard/DashboardFooter.tsx',
            ],
            'feature-chat': [
              './src/components/EcoChatbot.tsx',
              './src/api/chat.ts',
              './src/api/mockResponses.ts',
            ],
          },
        },
      },
    },
  };
});
