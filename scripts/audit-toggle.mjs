import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  channel: process.env.AUDIT_BROWSER || "msedge",
  headless: true,
});
const results = [];
const errors = [];

async function checkIcon(page, theme) {
  const state = await page.locator(".theme-toggle").evaluate((button) => {
    const images = [...button.querySelectorAll("img")];
    const visible = images.filter(
      (image) => getComputedStyle(image).visibility === "visible",
    );
    return {
      theme: document.documentElement.dataset.theme,
      ready: images.length === 2 && images.every((i) => i.complete && i.naturalWidth > 0),
      visible: visible.map((i) => i.className),
      width: visible[0]?.getBoundingClientRect().width,
    };
  });
  assert.equal(state.theme, theme);
  assert.equal(state.ready, true, "Ambos os ícones devem estar carregados");
  assert.equal(state.visible.length, 1);
  assert.ok(state.visible[0].includes(`theme-toggle-${theme}`));
  assert.equal(state.width, 28, "Ícone deve continuar visível no mobile");
  await page.getByRole("button", {
    name: new RegExp(`^Tema: ${theme === "dark" ? "Escuro" : "Claro"}\\.`),
  }).waitFor();
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const initial of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme: initial,
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base);
      await page.getByLabel("Número da Pokédex", { exact: true }).waitFor();
      await page.locator(".theme-toggle img").evaluateAll(
        (images) => Promise.all(images.map((image) => image.decode())),
      );
      await checkIcon(page, initial);
      // Watch the first click too: changing theme must not replace/reload images.
      await page.locator(".theme-toggle").evaluate((button) => {
        window.toggleSourceChanges = 0;
        new MutationObserver((records) => {
          window.toggleSourceChanges += records.filter((r) => r.attributeName === "src").length;
        }).observe(button, { subtree: true, attributes: true, attributeFilter: ["src"] });
      });
      const imageRequests = [];
      page.on("request", (request) => {
        if (request.resourceType() === "image") imageRequests.push(request.url());
      });
      const button = page.locator(".theme-toggle");
      await button.focus();
      await page.keyboard.press("Enter");
      const opposite = initial === "light" ? "dark" : "light";
      await checkIcon(page, opposite);
      await page.keyboard.press("Space");
      await checkIcon(page, initial);
      // Ten rapid clicks in one task catch stale-state updates as well as delays.
      const immediate = await button.evaluate((element) => {
        const themes = [];
        for (let i = 0; i < 10; i++) {
          element.click();
          themes.push(document.documentElement.dataset.theme);
        }
        return themes;
      });
      assert.deepEqual(immediate, Array.from({ length: 10 }, (_, i) => i % 2 ? initial : opposite));
      await checkIcon(page, initial);
      assert.equal(await page.evaluate(() => window.toggleSourceChanges), 0);
      assert.deepEqual(imageRequests, [], "Troca de tema não deve solicitar imagens");
      await button.click();
      await checkIcon(page, opposite);
      await page.reload();
      await page.getByLabel("Número da Pokédex", { exact: true }).waitFor();
      await checkIcon(page, opposite);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      results.push({ width, systemTheme: initial, persistedTheme: opposite, passed: true });
      await context.close();
    }
  }
  const blocked = await browser.newContext({ colorScheme: "dark" });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new Error("Storage blocked"); },
    });
  });
  const page = await blocked.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.getByRole("alert").waitFor();
  await checkIcon(page, "dark");
  await page.getByRole("button", { name: /^Tema:/ }).click();
  await checkIcon(page, "light");
  await blocked.close();
  assert.deepEqual(errors, []);
  await mkdir("artifacts/toggle", { recursive: true });
  await writeFile("artifacts/toggle/regression.json", JSON.stringify({ base, results, storageBlocked: true, errors }, null, 2));
  console.log("Toggle aprovado: cinco larguras, dois temas, teclado, dez cliques rápidos, zero trocas de src/requisições de imagem, reload e armazenamento bloqueado.");
} finally {
  await browser.close();
}
