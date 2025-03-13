// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/scripts',
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  pwa: {
    manifest: {
      name: 'Fokas',
      short_name: 'Fokas',
      description: 'Stay focused with gentle reminders',
      theme_color: '#111827',
      background_color: '#111827',
      display: 'standalone',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      screenshots: [
        {
          src: '/screenshots/wide.png',
          sizes: '1920x1080',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/mobile.png',
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,json,woff2}'], // Cache essential files
      runtimeCaching: [
        {
          urlPattern: 'https://fonts.googleapis.com/.*',
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts'
          }
        },
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst', // Try network first, then cache
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
            }
          }
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst', // Cache images
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst', // Cache images
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        },
        {
          urlPattern: ({ request }) =>
            ['style', 'script', 'worker'].includes(request.destination),
          handler: 'StaleWhileRevalidate', // Cache but check for updates
          options: {
            cacheName: 'static-resources'
          }
        }
      ]
    },
    registerType: 'autoUpdate', // Automatically update service worker
    devOptions: {
      enabled: true, // Enable PWA in dev mode
      type: 'module' // Use module service worker
    }
  },
  app: {
    head: {
      title: 'Fokas - Stay Focused',
      meta: [
        { name: 'description', content: 'A simple focus timer with reminders' }
      ],
      link: [{ rel: 'manifest', href: '/manifest.json' }]
    }
  }
})