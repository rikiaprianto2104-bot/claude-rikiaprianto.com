// Hanya untuk pengembangan lokal (npm start): teruskan panggilan API ke dua
// layanan backend yang berjalan di localhost — Explorer di 8787
// (backend/explorer_api.py) dan Kelas Lanjutan di 8788 (backend/lanjutan_api.py).
// Di produksi nginx yang meneruskannya, jadi berkas ini tidak ikut build.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    '/api/explorer',
    createProxyMiddleware({ target: 'http://localhost:8787', changeOrigin: false })
  );
  app.use(
    '/api/lanjutan',
    createProxyMiddleware({ target: 'http://localhost:8788', changeOrigin: false })
  );
};
