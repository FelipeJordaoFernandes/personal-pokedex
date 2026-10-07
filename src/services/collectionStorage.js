export const STORAGE_KEY = "pokedex-go-collection";

export function readCollection(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { list: [], message: "", writable: true };
    const list = JSON.parse(raw);
    if (
      !Array.isArray(list) ||
      !list.every(
        (pokemon) =>
          pokemon &&
          typeof pokemon.id === "string" &&
          typeof pokemon.name === "string" &&
          Number.isSafeInteger(Number(pokemon.number)) &&
          Number(pokemon.number) > 0 &&
          typeof pokemon.image === "string" &&
          Array.isArray(pokemon.types) &&
          pokemon.types.every((type) => typeof type === "string"),
      )
    ) {
      throw new Error("Formato de coleção inválido");
    }
    return { list, message: "", writable: true };
  } catch {
    return {
      list: [],
      message:
        "Não foi possível ler a coleção salva. Os dados originais foram preservados; novas capturas ficarão apenas nesta sessão.",
      writable: false,
    };
  }
}
