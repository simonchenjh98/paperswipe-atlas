import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("preserves the PaperSwipe editorial design system", async () => {
  const [productCss, landingCss, aestheticCss, product, landing] = await Promise.all([
    readFile(new URL("app/frontier.css", root), "utf8"),
    readFile(new URL("app/frontier-landing.css", root), "utf8"),
    readFile(new URL("app/frontier-aesthetic.css", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/about/page.tsx", root), "utf8"),
  ]);
  const css = `${productCss}\n${landingCss}\n${aestheticCss}`;

  assert.match(css, /Instrument Serif/);
  assert.match(css, /DM Sans/);
  for (const color of ["#83f7d0", "#68d9ff", "#ff8d61", "#f1efe8"]) {
    assert.match(css.toLowerCase(), new RegExp(color));
  }
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:680px/);
  assert.match(product, /SignalFingerprint/);
  assert.match(product, /TopicConstellation/);
  assert.match(product, /FrontierMap/);
  assert.match(landing, /ProductStage/);
  assert.match(landing, /SignalDemo/);
  assert.match(landing, /MiniMap/);
});
