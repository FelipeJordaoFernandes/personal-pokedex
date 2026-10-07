import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.AUDIT_BROWSER || "msedge",
  headless: true,
});
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const { source, output, width, height } of [
    { source: "favicon.svg", output: "favicon-32.png", width: 32, height: 32 },
    {
      source: "favicon.svg",
      output: "apple-touch-icon.png",
      width: 180,
      height: 180,
    },
    {
      source: "social-card.svg",
      output: "social-card.png",
      width: 1200,
      height: 630,
    },
  ]) {
    await page.setViewportSize({ width, height });
    await page.setContent(
      `<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${await readFile(`public/${source}`, "utf8")}`,
    );
    await page.screenshot({ path: `public/${output}`, omitBackground: true });
  }
} finally {
  await browser.close();
}
