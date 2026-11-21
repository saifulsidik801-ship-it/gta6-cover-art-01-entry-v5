// Velvet Horizon — Cover Studio (make.fun gta6-cover-art-01 entry).
// Serves the offline app in app/ on PORT (default 8080). Node 22+ runs this
// TypeScript file directly (type stripping). Standard library only, no deps.
// All paths resolve from this file's own URL, never from the process cwd,
// so the server boots the same from any working directory.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(fileURLToPath(new URL(".", import.meta.url)), "app");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (url.pathname === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      res.end("ok");
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/") rel = "/index.html";
    const safe = normalize(rel).replace(/^(\.\.[/\\])+/, "");
    const file = join(appDir, safe);
    if (file !== appDir && !file.startsWith(appDir + sep)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, {
      "content-type": MIME[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  }
});

const port = Number(process.env.PORT ?? 8080);
server.listen(port, "127.0.0.1", () => {
  console.log(`Velvet Horizon Cover Studio on http://localhost:${port}`);
});
