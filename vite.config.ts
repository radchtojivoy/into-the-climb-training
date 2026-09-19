import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      includeAssets: ['brand/logo.png'],
      manifest: {
        name: 'Into the Climb: Training',
        short_name: 'ITC Training',
        description: 'Тренування скелелазів за індивідуальним планом',
        lang: 'uk',
        start_url: '/',
        display: 'standalone',
        background_color: '#f2ebdc',
        theme_color: '#1a1a1a',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
