const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname);
const port = Number(process.env.PORT) || 5500;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

function safeJoin(base, requestPath) {
  let p = decodeURIComponent((requestPath || "/").split("?")[0]);
  if (p === "/" || p === "") p = "index.html";
  else if (p.startsWith("/")) p = p.slice(1).replace(/\//g, path.sep);
  const resolved = path.resolve(path.join(base, p));
  const baseResolved = path.resolve(base);
  const rel = path.relative(baseResolved, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://127.0.0.1");
  const filePath = safeJoin(root, url.pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    fs.readFile(filePath, (e, data) => {
      if (e) {
        res.writeHead(500);
        res.end();
        return;
      }
      const type = mime[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`Hairqoo: http://localhost:${port}/`);
});
