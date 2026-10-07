import fs from "node:fs/promises";
import { createServer } from "node:net";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { chromium } from "playwright-core";

const base = process.env.AUDIT_URL || "http://127.0.0.1:4173/";
const phase = process.env.AUDIT_PHASE || "final";
const repetitions = Number(process.env.AUDIT_RUNS || 3);
const themes = (process.env.AUDIT_THEMES || "light,dark").split(",");
if (themes.some((theme) => !["light", "dark"].includes(theme)))
  throw new Error("Temas aceitos: light,dark.");
if (
  !/^[a-z0-9-]+$/.test(phase) ||
  !Number.isInteger(repetitions) ||
  repetitions < 1
) {
  throw new Error("Fase ou quantidade de medições inválida.");
}
const destination = `artifacts/lighthouse/${phase}`;
await fs.mkdir(destination, { recursive: true });
const results = [];
for (const mode of ["mobile", "desktop"]) {
  for (const theme of themes) {
    for (let run = 1; run <= repetitions; run++) {
      const server = createServer();
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const port = server.address().port;
      await new Promise((resolve) => server.close(resolve));
      const browser = await chromium.launch({
        channel: process.env.AUDIT_BROWSER || "msedge",
        headless: true,
        args: [`--remote-debugging-port=${port}`],
      });
      try {
        // Lighthouse uses the default browser context. Seed only a theme in its
        // disposable profile, retaining an empty collection for comparable runs.
        const cdp = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
        const page = await cdp.contexts()[0].newPage();
        await page.goto(base);
        await page.evaluate((selectedTheme) => {
          localStorage.clear();
          localStorage.setItem("pokedex-go-theme", selectedTheme);
        }, theme);
        const session = await page.context().newCDPSession(page);
        await session.send("Network.clearBrowserCache");
        await session.detach();
        await page.close();
        const { lhr, report } = await lighthouse(
          base,
          {
            port,
            output: ["json", "html"],
            logLevel: "error",
            locale: "pt-BR",
            disableStorageReset: true,
            onlyCategories: [
              "performance",
              "accessibility",
              "best-practices",
              "seo",
            ],
          },
          mode === "desktop" ? desktopConfig : undefined,
        );
        if (lhr.runtimeError) throw new Error(JSON.stringify(lhr.runtimeError));
        await fs.writeFile(
          `${destination}/${mode}-${theme}-${run}.json`,
          report[0],
        );
        await fs.writeFile(
          `${destination}/${mode}-${theme}-${run}.html`,
          report[1],
        );
        const entry = {
          mode,
          theme,
          run,
          version: lhr.lighthouseVersion,
          checkedAt: lhr.fetchTime,
          scores: Object.fromEntries(
            Object.entries(lhr.categories).map(([key, value]) => [
              key,
              Math.round(value.score * 100),
            ]),
          ),
          metrics: Object.fromEntries(
            [
              "first-contentful-paint",
              "largest-contentful-paint",
              "total-blocking-time",
              "cumulative-layout-shift",
            ].map((key) => [key, lhr.audits[key].numericValue]),
          ),
          findings: Object.values(lhr.audits)
            .filter(
              (a) =>
                a.score !== null &&
                a.score < 1 &&
                a.scoreDisplayMode !== "informative",
            )
            .map((a) => ({
              id: a.id,
              title: a.title,
              display: a.displayValue,
            })),
        };
        results.push(entry);
        await fs.writeFile(
          `${destination}/summary.json`,
          JSON.stringify({ base, phase, results }, null, 2),
        );
        console.log(JSON.stringify(entry));
      } finally {
        await browser.close();
      }
    }
  }
}
