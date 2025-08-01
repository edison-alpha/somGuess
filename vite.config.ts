import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
server: {
  host: "0.0.0.0",
  port: 8080,
  proxy: {
    '/subgraph': {
      target: 'https://api.subgraph.somnia.network',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/subgraph/, ''),
    },
  },
},
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
