// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://www.carpetclub.pt',
  output: 'static',
  adapter: vercel(),
  redirects: {
    '/events': '/events/room',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({ filter: (page) => page !== "https://www.carpetclub.pt/events/" }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
