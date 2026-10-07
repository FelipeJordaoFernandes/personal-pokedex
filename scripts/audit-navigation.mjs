import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173/";
const browserName = process.env.AUDIT_BROWSER || "msedge";
const url = new URL("?origem=qa%23valor&modo=teste", base).href;
const image = "data:image/png;base64," + (await readFile("public/favicon-32.png")).toString("base64");
const browser = await chromium.launch({ channel: browserName, headless: true });
const results = [];
const errors = [];

async function ready(page) {
  await page.waitForFunction(() => document.querySelectorAll(".pokemon-card").length === 24);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
}
async function top(page) {
  await ready(page);
  assert.equal(page.url(), url, "URL deve preservar caminho/query e remover fragmento");
  assert.equal(await page.evaluate(() => scrollY), 0, "Entrada/reload deve começar no topo");
  assert.equal(await page.locator(".pokemon-card").count(), 24);
}
async function destination(page, previousHistory) {
  await page.waitForFunction(() => scrollY > 0);
  assert.equal(page.url(), url);
  assert.equal(await page.evaluate(() => document.activeElement.id), "collection-title");
  assert.equal(await page.evaluate(() => history.length), previousHistory);
  assert.deepEqual(await page.evaluate(() => history.state), { navigationTest: "preserve" });
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height: 844 }, colorScheme: theme,
        reducedMotion: width === 390 ? "no-preference" : "reduce",
      });
      await context.addInitScript(({ image, theme }) => {
        if (!localStorage.getItem("pokedex-go-collection")) {
          localStorage.setItem("pokedex-go-theme", theme);
          localStorage.setItem("pokedex-go-collection", JSON.stringify(Array.from({ length: 24 }, (_, i) => ({
            id: String(i), number: i + 1, name: `Pokémon ${i + 1}`, image, types: ["Grass"],
          }))));
        }
      }, { image, theme });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url + "#collection-title");
      await top(page);
      await page.evaluate(() => history.replaceState({ navigationTest: "preserve" }, ""));
      const previousHistory = await page.evaluate(() => history.length);
      await page.keyboard.press("Tab");
      assert.equal(await page.evaluate(() => document.activeElement.className), "skip-link");
      await page.keyboard.press("Enter");
      await destination(page, previousHistory);
      await page.reload();
      await top(page);
      await page.getByRole("link", { name: "Explorar minha coleção" }).click();
      await destination(page, previousHistory);
      await page.reload();
      await top(page);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      assert.ok(await page.evaluate(() => scrollY > 0));
      await page.reload();
      await top(page);
      assert.equal(await page.locator("html").getAttribute("data-theme"), theme);
      assert.equal(await page.title(), "Personal Pokédex");
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), "https://personal-pokedex.vercel.app/");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      // Native modified links still work; the new tab also cleans its old fragment.
      if (width === 390 && theme === "light") {
        const popupPromise = context.waitForEvent("page");
        await page.getByRole("link", { name: "Explorar minha coleção" }).click({ modifiers: ["Control"] });
        const popup = await popupPromise;
        await popup.waitForLoadState();
        await top(popup);
        await popup.close();
        assert.equal(page.url(), url);
      }
      await page.goto(url + "#");
      await top(page);
      results.push({ width, theme, passed: true, reloadAtTop: true, cleanUrl: true, focusAndHistoryPreserved: true });
      await context.close();
    }
  }
  assert.deepEqual(errors, []);
  await mkdir("artifacts/navigation", { recursive: true });
  await writeFile(`artifacts/navigation/${browserName}.json`, JSON.stringify({ base, browser: browserName, results, errors }, null, 2));
  console.log(`Navegação aprovada em ${browserName}: cinco larguras, dois temas, fragmento antigo/vazio, links/teclado, Ctrl+clique, query/history preservados, reload da seção/fim no topo e coleção intacta.`);
} finally {
  await browser.close();
}
