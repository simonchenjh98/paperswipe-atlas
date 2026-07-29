import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the PaperSwipe product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /PaperSwipe/);
  assert.match(html, /今天，发现点/);
  assert.match(html, /论文库/);
  assert.match(html, /阅读计划/);
  assert.match(html, /Atlas/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("includes complete discovery workflow and live data route", async () => {
  const [page, route, layout, packageJson] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/api/papers/route.ts", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);
  for (const state of ["saved", "priority", "read", "skipped"]) assert.match(page, new RegExp(state));
  assert.match(page, /downloadBibTeX/);
  assert.match(page, /function Trending/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(route, /api\.openalex\.org\/works/);
  assert.match(route, /abstract_inverted_index/);
  assert.match(layout, /PaperSwipe/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
