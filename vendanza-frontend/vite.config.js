import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, 'admin');

/** Serve a pasta /admin em desenvolvimento (HTML legado do painel). */
function serveAdminFolder() {
  return {
    name: 'serve-admin-folder',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/admin/')) return next();

        const relative = url.replace(/^\//, '');
        const filePath = path.resolve(__dirname, relative);

        if (!filePath.startsWith(adminRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          return next();
        }

        const types = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2',
        };
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

/**
 * Garante que ficheiros legados (admin/html/css/js/imagens) entram no dist.
 * Sem isto, o deploy estático fica só com a SPA React e /admin/*.html dá 404.
 */
function copyLegacyStaticFolders() {
  const folders = ['admin', 'css', 'imagens'];

  return {
    name: 'copy-legacy-static-folders',
    closeBundle() {
      const distRoot = path.resolve(__dirname, 'dist');
      for (const folder of folders) {
        const source = path.resolve(__dirname, folder);
        const target = path.resolve(distRoot, folder);
        if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) continue;
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(source, target, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), serveAdminFolder(), copyLegacyStaticFolders()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
