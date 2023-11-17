import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import AstroPWA from '@vite-pwa/astro'
import { defineConfig } from 'astro/config'
import remarkCollapse from 'remark-collapse'
import remarkToc from 'remark-toc'
import { SITE } from './src/config'

// https://astro.build/config
export default defineConfig({
    site: SITE.website,
    base: '/blog/',
    prefetch: {
        defaultStrategy: 'viewport'
    },
    integrations: [
        tailwind({
            applyBaseStyles: false
        }),
        react(),
        sitemap(),
        AstroPWA({
            // devOptions: {
            //     enabled: true
            // },
            registerType: 'autoUpdate',
            manifest: {
                name: "Aaron's Blog",
                short_name: "Aaron's Blog",
                description: 'Blogs about everything in frontend development',
                start_url: 'index.html',
                id: 'aaron-blog',
                scope: '/',
                icons: [
                    {
                        src: 'assets/pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'assets/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'assets/maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },
            workbox: {
                skipWaiting: true,
                clientsClaim: true,
                // only precache the root index and critical assets (base.css is bundled into about.[hash].css)
                globPatterns: ['{**/{hoisted,client,about}*.{js,css},index.html}'],
                maximumFileSizeToCacheInBytes: 50 * 1000 * 1000,
                sourcemap: false,
                navigateFallback: null,
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /\.(js|css|ttf)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'app-resources',
                            cacheableResponse: {
                                statuses: [200]
                            },
                            expiration: {
                                maxAgeSeconds: 60 * 24 * 60 * 60
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg)$/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'app-images',
                            cacheableResponse: {
                                statuses: [200]
                            },
                            expiration: {
                                maxAgeSeconds: 60 * 24 * 60 * 60,
                                maxEntries: 100
                            }
                        }
                    }
                ]
            }
        })
    ],
    markdown: {
        remarkPlugins: [
            remarkToc,
            [
                remarkCollapse,
                {
                    test: 'Table of contents'
                }
            ]
        ],
        shikiConfig: {
            theme: 'one-dark-pro',
            wrap: true
        }
    },
    vite: {
        optimizeDeps: {
            exclude: ['@resvg/resvg-js']
        }
    },
    scopedStyleStrategy: 'where'
})
