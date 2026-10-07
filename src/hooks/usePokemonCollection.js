import { useState } from "react";
import { useHydrated } from "./useHydrated.js";
import { readCollection, STORAGE_KEY } from "../services/collectionStorage.js";

function getInitialCollection() {
  if (typeof window === "undefined")
    return { list: [], message: "", writable: true };
  // Accessing window.localStorage itself may throw when browser storage is blocked.
  try {
    return readCollection(window.localStorage);
  } catch {
    return readCollection({
      getItem() {
        throw new Error("Armazenamento indisponível");
      },
    });
  }
}

export function usePokemonCollection() {
  const hydrated = useHydrated();
  const [initial] = useState(getInitialCollection);
  const [pokemonList, setPokemonList] = useState(initial.list);
  const [storageMessage, setStorageMessage] = useState(initial.message);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleList = hydrated ? pokemonList : [];
  const filteredPokemon = visibleList.filter(
    (pokemon) =>
      !normalizedSearch ||
      pokemon.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
      String(pokemon.number).includes(normalizedSearch) ||
      pokemon.types.some((type) =>
        type.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
      ),
  );

  function updateCollection(nextList) {
    setPokemonList(nextList);
    if (!initial.writable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      setStorageMessage(
        "O navegador não conseguiu salvar a coleção. Suas alterações ficam apenas nesta sessão.",
      );
    }
  }
  function addPokemon(data) {
    if (pokemonList.some((pokemon) => Number(pokemon.number) === data.number)) {
      return {
        ok: false,
        message: "Esse número da Pokédex já foi registrado.",
      };
    }
    updateCollection(
      [
        ...pokemonList,
        {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        },
      ].sort((a, b) => Number(a.number) - Number(b.number)),
    );
    return { ok: true };
  }
  function removePokemon(id) {
    updateCollection(pokemonList.filter((pokemon) => pokemon.id !== id));
  }
  return {
    pokemonList: visibleList,
    filteredPokemon,
    search,
    setSearch,
    addPokemon,
    removePokemon,
    storageMessage: hydrated ? storageMessage : "",
  };
}
