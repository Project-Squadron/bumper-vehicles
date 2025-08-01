import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Different port to avoid conflicts
    strictPort: true, // Fail if port is occupied instead of trying another port
    historyApiFallback: true,
  },
});
