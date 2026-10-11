const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'www');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm'
};

function send(res, status, headers, body) {
  res.writeHead(status, {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const requested = clean ? path.resolve(root, clean) : path.join(root, 'index.html');
  if (!requested.startsWith(root)) return null;
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) return requested;
  if (fs.existsSync(requested) && fs.statSync(requested).isDirectory()) {
    const index = path.join(requested, 'index.html');
    if (fs.existsSync(index)) return index;
  }
  return null;
}

const server = http.createServer((req, res) => {
  try {
    const file = resolveFile(req.url || '/');
    if (!file) {
      send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    send(res, 200, { 'Content-Type': types[ext] || 'application/octet-stream' }, fs.readFileSync(file));
  } catch (err) {
    send(res, 500, { 'Content-Type': 'text/plain; charset=utf-8' }, String(err && err.stack || err));
  }
});

server.listen(port, host, () => {
  console.log(`Güverte dev server: http://${host}:${port}/`);
  console.log(`Serving ${root} with no-cache headers`);
});
