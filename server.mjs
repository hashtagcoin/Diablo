import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

function filePathForRequest(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = normalize(pathname === "/" ? "/index.html" : pathname);
  const filePath = resolve(join(root, requested));
  return filePath.startsWith(root) ? filePath : null;
}

const server = createServer((req, res) => {
  const filePath = filePathForRequest(req.url || "/");
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Umbral Descent running at http://localhost:${port}/`);
});
