const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 3000);
const LOCATION = 'זאב פלק 18 ירושלים';

const sourceCache = new Map();

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

async function fetchItimLabina(date) {
  const key = date || dateKey();

  if (sourceCache.has(key)) {
    return sourceCache.get(key);
  }

  const url = new URL('https://www.itimlabina.com/api/zmanim');
  url.searchParams.set('address', LOCATION);
  url.searchParams.set('date', key);

  const response = await fetch(url, {
    headers: {
      'accept': 'application/json, text/plain, */*',
      'user-agent': 'digital-clock-synagogue/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`itimlabina upstream failed (${response.status})`);
  }

  const payload = await response.json();
  sourceCache.set(key, payload);
  return payload;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requestPath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(process.cwd(), safePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { error: 'Invalid request' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/zmanim') {
    try {
      const date = url.searchParams.get('date') || dateKey();
      const payload = await fetchItimLabina(date);
      sendJson(res, 200, payload);
    } catch (error) {
      sendJson(res, 502, { error: error.message });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
