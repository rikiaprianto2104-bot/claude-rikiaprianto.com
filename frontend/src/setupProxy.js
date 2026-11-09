// Hanya untuk pengembangan lokal (npm start): teruskan /api/explorer ke API
// pendaftar Explorer yang berjalan di localhost:8787 (backend/explorer_api.py).
// Di produksi nginx yang meneruskannya, jadi berkas ini tidak ikut build.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    '/api/explorer',
    createProxyMiddleware({ target: 'http://localhost:8787', changeOrigin: false })
  );
};
