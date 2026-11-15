import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), VitePWA({
    injectRegister: null,
    manifest: {
      id: '/',
      name: 'Metseri',
      short_name: 'Metseri',
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#080b12',
      background_color: '#080b12',
      icons: [
        { src: '/iconosPwa/metseri192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/iconosPwa/metseri512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/iconosPwa/metseriAdaptable512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['index.html', 'assets/**/*', 'imagenes/**/*.webp', 'iconosPwa/metseriTactil180.png'],
      navigateFallback: 'index.html',
      navigateFallbackAllowlist: [/^\/(?:\?|$)/u],
      cleanupOutdatedCaches: true,
      skipWaiting: false,
      clientsClaim: true,
    },
  })],
  server: {
    proxy: { '/api': `http://localhost:${process.env.PORT || loadEnv(mode, process.cwd(), 'PORT').PORT || 3000}` },
  },
}))
