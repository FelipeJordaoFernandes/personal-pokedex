import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173/";
const browser = await chromium.launch({
  channel: process.env.AUDIT_BROWSER || "msedge",
  headless: true,
});
const results = [];
const browserErrors = [];
const fixtureImage = "https://images.example.test/pokemon.svg";
const fixtureApi = {
  name: "pikachu",
  sprites: {
    other: { "official-artwork": { front_default: fixtureImage } },
    front_default: fixtureImage,
  },
  types: [{ slot: 1, type: { name: "electric" } }],
};
await mkdir("artifacts/ui", { recursive: true });

async function audit(page, state, width, theme) {
  await page.evaluate(() => document.fonts.ready);
  const { violations, incomplete, passes } = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  results.push({
    state,
    width,
    theme,
    violations,
    incomplete,
    passes: passes.length,
  });
  await writeFile(
    "artifacts/ui/summary.json",
    JSON.stringify({ base, results, browserErrors }, null, 2),
  );
  assert.deepEqual(
    violations,
    [],
    `${state} / ${width}px / ${theme}: violações axe`,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    `${state}: transbordamento horizontal`,
  );
}
async function fillManual(
  page,
  {
    number = "133",
    name = "Eevee",
    type = "Normal",
    image = fixtureImage,
  } = {},
) {
  await page.getByLabel("Número da Pokédex", { exact: true }).fill(number);
  await page.getByLabel("Nome", { exact: true }).fill(name);
  await page.getByLabel("URL da imagem").fill(image);
  await page.getByLabel("Tipo principal", { exact: true }).fill(type);
  await page
    .getByRole("button", { name: "Registrar captura", exact: true })
    .click();
}
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const theme of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        colorScheme: theme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => browserErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      await page.route("https://images.example.test/**", (route) =>
        route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="148" height="148"><circle cx="74" cy="74" r="50" fill="#e3bc4b"/><circle cx="57" cy="65" r="5"/><circle cx="91" cy="65" r="5"/><path d="M60 90q14 14 28 0" fill="none" stroke="#17231b" stroke-width="4"/></svg>',
        }),
      );
      await page.route("https://pokeapi.co/api/v2/pokemon/**", (route) =>
        route.fulfill({ json: fixtureApi }),
      );
      await page.goto(base);
      await page.getByLabel("Número da Pokédex", { exact: true }).waitFor();
      assert.equal(await page.title(), "Personal Pokédex");
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        theme,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement.className),
        "skip-link",
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "collection-title",
      );
      await audit(page, "vazia", width, theme);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `artifacts/ui/empty-${width}-${theme}.png`,
          fullPage: true,
        });

      await page
        .getByRole("button", { name: "Registrar meu primeiro Pokémon" })
        .click();
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "dex-number",
      );
      await page.getByLabel("Número da Pokédex", { exact: true }).fill("25");
      await page
        .getByRole("button", { name: "Preencher", exact: true })
        .click();
      await page
        .getByText("Dados preenchidos. Confira e registre sua captura.")
        .waitFor();
      assert.equal(
        await page.getByLabel("Nome", { exact: true }).inputValue(),
        "Pikachu",
      );
      await page
        .getByRole("button", { name: "Registrar captura", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Pikachu", exact: true })
        .waitFor();
      await fillManual(page);
      await page.getByRole("heading", { name: "Eevee", exact: true }).waitFor();
      await audit(page, "colecao-preenchida", width, theme);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `artifacts/ui/collection-${width}-${theme}.png`,
          fullPage: true,
        });
      await fillManual(page, {
        number: "25",
        name: "Duplicata",
        type: "Electric",
      });
      await page
        .getByText("Esse número da Pokédex já foi registrado.")
        .waitFor();
      assert.equal(await page.locator(".pokemon-card").count(), 2);
      if (width === 390) await audit(page, "erro-duplicata", width, theme);
      for (const search of ["PIKACHU", "25", "electric"]) {
        await page
          .getByRole("searchbox", { name: "Buscar na coleção" })
          .fill(search);
        assert.equal(await page.locator(".pokemon-card").count(), 1);
        await page
          .getByRole("heading", { name: "Pikachu", exact: true })
          .waitFor();
      }
      await page.getByRole("searchbox").fill("inexistente");
      await page
        .getByRole("heading", { name: "Nenhuma captura por aqui." })
        .waitFor();
      if (width === 390) await audit(page, "busca-vazia", width, theme);
      await page.getByRole("button", { name: "Limpar busca" }).click();
      await page.getByRole("button", { name: /^Tema:/ }).click();
      const toggledTheme = theme === "dark" ? "light" : "dark";
      await page.reload();
      await page.getByRole("heading", { name: "Eevee", exact: true }).waitFor();
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        toggledTheme,
      );
      assert.equal(await page.locator(".pokemon-card").count(), 2);
      await page
        .getByRole("button", { name: "Remover Pikachu", exact: true })
        .click();
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "collection-title",
      );
      await page.reload();
      await page.getByRole("heading", { name: "Eevee", exact: true }).waitFor();
      assert.equal(await page.locator(".pokemon-card").count(), 1);
      if (width === 390 && theme === "light") {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = "200%";
        });
        await audit(page, "texto-200-porcento", width, toggledTheme);
      }
      await context.close();
    }
  }

  // Invalid legacy data must survive loading and attempted additions byte for byte.
  const recovery = await browser.newContext();
  await recovery.addInitScript(() => {
    localStorage.setItem("pokedex-go-collection", "{invalid");
  });
  const recoveryPage = await recovery.newPage();
  await recoveryPage.goto(base);
  await recoveryPage.getByRole("alert").waitFor();
  await fillManual(recoveryPage);
  assert.equal(
    await recoveryPage.evaluate(() =>
      localStorage.getItem("pokedex-go-collection"),
    ),
    "{invalid",
  );
  await recovery.close();

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base);
  await blockedPage.getByRole("alert").waitFor();
  await fillManual(blockedPage);
  await blockedPage
    .getByRole("heading", { name: "Eevee", exact: true })
    .waitFor();
  await blocked.close();

  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base);
  await staticPage.getByRole("heading", { level: 1 }).waitFor();
  assert.equal(
    await staticPage.locator("fieldset").getAttribute("disabled"),
    "",
  );
  assert.equal(
    await staticPage
      .getByLabel("Número da Pokédex", { exact: true })
      .isDisabled(),
    true,
  );
  assert.match(
    await staticPage.locator("noscript").textContent(),
    /Ative o JavaScript/,
  );
  await noJs.close();

  assert.deepEqual(browserErrors, [], "Erros no navegador");
  await writeFile(
    "artifacts/ui/summary.json",
    JSON.stringify(
      { base, results, browserErrors, flowsPassed: true },
      null,
      2,
    ),
  );
  console.log(
    `${results.length} verificações axe sem violações; fluxos, cinco larguras, dois temas, teclado, reload, texto 200%, armazenamento e HTML estático aprovados.`,
  );
} finally {
  await browser.close();
}
