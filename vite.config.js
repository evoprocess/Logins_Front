import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/Logins_Front/',
  plugins: [{
    name: 'copy-organization-logos',
    closeBundle() {
      cpSync(`${root}imagens`, `${root}dist/imagens`, { recursive: true });
    }
  }]
});
