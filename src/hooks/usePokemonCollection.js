import { useEffect, useState } from "react";

const STORAGE_KEY = "pokedex-go-collection";

function getInitialCollection() {
  const storedCollection = localStorage.getItem(STORAGE_KEY);

  if (!storedCollection) {
    return [];
  }

  try {
    return JSON.parse(storedCollection);
  } catch {
    return [];
  }
}

export function usePokemonCollection() {
  const [search, setSearch] = useState("");
  const [pokemonList, setPokemonList] = useState(getInitialCollection);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemonList));
  }, [pokemonList]);

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      pokemon.name.toLowerCase().includes(normalizedSearch) ||
      String(pokemon.number).includes(normalizedSearch) ||
      pokemon.types.some((type) =>
        type.toLowerCase().includes(normalizedSearch),
      )
    );
  });

  function addPokemon(pokemonData) {
    const alreadyExists = pokemonList.some(
      (pokemon) => pokemon.number === pokemonData.number,
    );

    if (alreadyExists) {
      return { ok: false };
    }

    const newPokemon = {
      id: crypto.randomUUID(),
      ...pokemonData,
      createdAt: new Date().toISOString(),
    };

    setPokemonList((currentList) =>
      [...currentList, newPokemon].sort((firstPokemon, secondPokemon) => {
        return firstPokemon.number - secondPokemon.number;
      }),
    );

    return { ok: true };
  }

  function removePokemon(pokemonId) {
    setPokemonList((currentList) =>
      currentList.filter((pokemon) => pokemon.id !== pokemonId),
    );
  }

  return {
    pokemonList,
    filteredPokemon,
    search,
    setSearch,
    addPokemon,
    removePokemon,
  };
}
