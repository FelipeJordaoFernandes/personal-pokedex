import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.AUDIT_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  channel: process.env.AUDIT_BROWSER || "msedge",
  headless: true,
});
await mkdir("artifacts/live", { recursive: true });
const result = { base, api: [], errors: [], images: [] };
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
    colorScheme: "dark",
  });
  page.on("pageerror", (error) => result.errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith("https://pokeapi.co/api/v2/pokemon/"))
      result.api.push({ url: response.url(), status: response.status() });
  });
  await page.goto(base);
  // Real API, real artwork; this browser context has no personal data.
  for (const number of ["1", "4", "7", "25", "94", "133"]) {
    await page.getByLabel("Número da Pokédex", { exact: true }).fill(number);
    await page.getByRole("button", { name: "Preencher", exact: true }).click();
    await page
      .getByText("Dados preenchidos. Confira e registre sua captura.")
      .waitFor({ timeout: 15000 });
    await page
      .getByRole("button", { name: "Registrar captura", exact: true })
      .click();
  }
  assert.equal(await page.locator(".pokemon-card").count(), 6);
  await page.locator(".card-grid").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".pokemon-image")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  result.images = await page
    .locator(".pokemon-image")
    .evaluateAll((images) =>
      images.map((image) => ({ src: image.src, width: image.naturalWidth })),
    );
  assert.equal(result.images.length, 6);
  await page.evaluate(() => {
    document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "artifacts/live/desktop-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Tema:/ }).click();
  await page.screenshot({
    path: "artifacts/live/desktop-light.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/live/mobile-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Tema:/ }).click();
  await page.screenshot({
    path: "artifacts/live/mobile-dark.png",
    fullPage: true,
  });
  await page.getByLabel("Número da Pokédex", { exact: true }).fill("999999");
  await page.getByRole("button", { name: "Preencher", exact: true }).click();
  await page
    .getByText(
      "Pokémon não encontrado. Confira o número ou preencha manualmente.",
    )
    .waitFor();
  await page.route("https://pokeapi.co/**", (route) =>
    route.abort("internetdisconnected"),
  );
  await page.getByLabel("Número da Pokédex", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Preencher", exact: true }).click();
  await page
    .getByText(
      "Não foi possível acessar a PokeAPI. Tente novamente ou preencha manualmente.",
    )
    .waitFor();
  assert.deepEqual(result.errors, []);
  result.passed = true;
  console.log(JSON.stringify(result));
} finally {
  await writeFile(
    "artifacts/live/summary.json",
    JSON.stringify(result, null, 2),
  );
  await browser.close();
}
