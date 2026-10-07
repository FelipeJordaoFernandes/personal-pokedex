import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readCollection,
  STORAGE_KEY,
} from "../src/services/collectionStorage.js";
import {
  formatDexNumber,
  formatPokemonName,
  fetchPokemonByNumber,
} from "../src/services/pokeApi.js";

test("mantém os registros no formato antigo e a chave de armazenamento", () => {
  const list = [
    {
      id: "original",
      number: 1,
      name: "Bulbasaur",
      image: "https://example.com/1.png",
      types: ["Grass", "Poison"],
      createdAt: "2026-04-29",
    },
  ];
  const stored = JSON.stringify(list);
  const result = readCollection({
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return stored;
    },
  });
  assert.deepEqual(result, { list, message: "", writable: true });
});
test("dados inválidos e armazenamento bloqueado não quebram a página nem autorizam sobrescrita", () => {
  for (const raw of ["{", "{}", "[null]", '[{"id":"incompleto"}]']) {
    const result = readCollection({ getItem: () => raw });
    assert.equal(result.writable, false);
    assert.deepEqual(result.list, []);
    assert.ok(result.message);
  }
  assert.equal(
    readCollection({
      getItem() {
        throw new Error("Bloqueado");
      },
    }).writable,
    false,
  );
});
test("formata nomes e números da Pokédex", () => {
  assert.equal(formatDexNumber(25), "#0025");
  assert.equal(formatPokemonName("mr-mime"), "Mr Mime");
});
test("PokeAPI ordena tipos e usa sprite quando não há artwork", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://pokeapi.co/api/v2/pokemon/25");
    assert.ok(options.signal);
    return {
      ok: true,
      json: async () => ({
        name: "pikachu",
        sprites: {
          other: { "official-artwork": { front_default: null } },
          front_default: "https://example.com/25.png",
        },
        types: [
          { slot: 2, type: { name: "fairy" } },
          { slot: 1, type: { name: "electric" } },
        ],
      }),
    };
  });
  assert.deepEqual(await fetchPokemonByNumber(25), {
    name: "Pikachu",
    image: "https://example.com/25.png",
    types: ["Electric", "Fairy"],
  });
});
test("PokeAPI reporta número não encontrado", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false }));
  await assert.rejects(fetchPokemonByNumber(999999), /Pokémon não encontrado/);
});
