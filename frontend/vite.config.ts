import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
 
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dir, "./src"),
      "@server": path.resolve(import.meta.dir, "../server"),
    },
  },
  server: {
    proxy: {
      "^/api/": {
        target: "http://127.0.0.1:3000",
        ws:true,
        changeOrigin: true,
      },
      "^/api/containers/ws$": { 
        target: "ws://localhost:3000",
        ws:true,
        rewriteWsOrigin: false,
      },        
      "/vnc": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      }
    }
  }
})