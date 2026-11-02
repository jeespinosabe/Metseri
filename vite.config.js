import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: { '/api': `http://localhost:${process.env.PORT || loadEnv(mode, process.cwd(), 'PORT').PORT || 3000}` },
  },
}))
