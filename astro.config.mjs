import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  output: 'server',
  server: { host: '0.0.0.0', port: 3000, allowedHosts: ['terminal.local'] },
  session: false,
  adapter: cloudflare({ imageService: 'compile', inspectorPort: false }),
  integrations: [react()],
  build: {
    client: './client/',
    server: './server/',
    serverEntry: 'index.js',
  },
  vite: {
    server: { strictPort: true },
    plugins: [{
      name: 'radar-server-boundary',
      resolveId(source, _importer, options) {
        if (source !== 'server-only') return;
        if (this.environment?.name === 'client' || options?.ssr === false) {
          throw new Error('A server-only module cannot enter the browser bundle.');
        }
        return '\0radar-server-only';
      },
      load(id) { if (id === '\0radar-server-only') return 'export {};'; },
    }],
  },
});
