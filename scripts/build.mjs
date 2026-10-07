import { build } from "vite";
import { readFile, writeFile, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

await build();
const serverDirectory = path.resolve("node_modules/.cache/pokedex-prerender");
try {
  await build({
    build: {
      ssr: "src/entry-server.jsx",
      outDir: serverDirectory,
      emptyOutDir: true,
    },
  });
  const { render } = await import(
    pathToFileURL(path.join(serverDirectory, "entry-server.js")).href
  );
  const template = await readFile("dist/index.html", "utf8");
  await writeFile(
    "dist/index.html",
    template.replace(
      '<div id="root"></div>',
      `<div id="root">${render()}</div>`,
    ),
  );
} finally {
  await rm(serverDirectory, { recursive: true, force: true });
}
