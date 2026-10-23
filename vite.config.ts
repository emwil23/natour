/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Shown at the bottom of Settings, so anyone can tell which build they're on.
const build = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
})()

export default defineConfig({
  define: { __BUILD__: JSON.stringify(`${build} · ${new Date().toISOString().slice(0, 10)}`) },
  plugins: [
    react(),
    {
      // A copy of the plain index.html for the service worker's offline fallback. index.html itself gets
      // prerendered landing content after the build (scripts/prerender.mjs), which /app must never show.
      name: 'app-shell',
      enforce: 'post',
      generateBundle(_, bundle) {
        const html = bundle['index.html']
        if (html.type === 'asset')
          this.emitFile({ type: 'asset', fileName: 'shell/index.html', source: html.source })
      },
    },
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Natour',
        short_name: 'Natour',
        description: 'An AI trip planner that only suggests real places',
        theme_color: '#1B2420',
        background_color: '#F4EFE6',
        display: 'standalone',
        start_url: '/app',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          { name: 'Plan a trip', url: '/app' },
          { name: 'Journal', url: '/app/journal' },
        ],
      },
      workbox: {
        // Take over as soon as a new version installs, so a deploy reaches open tabs on their next load.
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,svg,woff2,avif,webp,png}', 'shell/index.html'],
        // The hero video, the 3D globe and the map library are big; they load when needed instead of on install.
        globIgnores: [
          '**/media/*.mp4',
          '**/media/*.webm',
          '**/GlobeScene-*.js',
          '**/MapView-*.js',
          '**/react-three-fiber*.js',
        ],
        // No runtime caching: map tiles come from OpenFreeMap with its own HTTP caching, Unsplash photos must
        // be hotlinked, and place answers are cached by the server.
        navigateFallback: '/shell/index.html',
      },
    }),
  ],
  // The lazy 3D chunks (three.js) are ~1 MB by themselves; they load after first paint, and only with WebGL.
  build: { chunkSizeWarningLimit: 1200 },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
