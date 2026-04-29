export function formatDexNumber(number) {
  return `#${String(number).padStart(4, "0")}`;
}

export function formatPokemonName(name) {
  if (!name) {
    return "";
  }

  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function fetchPokemonByNumber(number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);

  if (!response.ok) {
    throw new Error("Pokémon não encontrado.");
  }

  const pokemonData = await response.json();
  const artwork =
    pokemonData.sprites.other["official-artwork"].front_default ||
    pokemonData.sprites.front_default;
  const types = [...pokemonData.types]
    .sort((firstType, secondType) => firstType.slot - secondType.slot)
    .map((typeItem) => formatPokemonName(typeItem.type.name));

  return {
    name: formatPokemonName(pokemonData.name),
    image: artwork,
    types,
  };
}
