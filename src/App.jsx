import { useEffect, useState } from "react";
import "./App.css";
import lunatoneIcon from "./assets/lunatone.png";
import solrockIcon from "./assets/solrock.png";

const STORAGE_KEY = "pokedex-go-collection";
const THEME_KEY = "pokedex-go-theme";

const emptyForm = {
  name: "",
  number: "",
  image: "",
  type1: "",
  type2: "",
};

function formatDexNumber(number) {
  return `#${String(number).padStart(4, "0")}`;
}

function formatPokemonName(name) {
  if (!name) {
    return "";
  }

  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitialTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function App() {
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [isFetchingPokemon, setIsFetchingPokemon] = useState(false);
  const [fetchMessage, setFetchMessage] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [pokemonList, setPokemonList] = useState(() => {
    const storedCollection = localStorage.getItem(STORAGE_KEY);

    if (!storedCollection) {
      return [];
    }

    try {
      return JSON.parse(storedCollection);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pokemonList));
  }, [pokemonList]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "number") {
      setFetchMessage("");
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleAutoFill() {
    const number = Number(formData.number);

    if (!number) {
      setFetchMessage("Digite um número da Pokédex para buscar.");
      return;
    }

    setIsFetchingPokemon(true);
    setFetchMessage("");

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${number}`,
      );

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

      setFormData((currentData) => ({
        ...currentData,
        name: formatPokemonName(pokemonData.name),
        image: artwork ?? currentData.image,
        type1: types[0] ?? "",
        type2: types[1] ?? "",
      }));
    } catch {
      setFetchMessage("Não foi possível buscar esse Pokémon agora.");
    } finally {
      setIsFetchingPokemon(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const image = formData.image.trim();
    const number = Number(formData.number);
    const primaryType = formData.type1.trim();
    const secondaryType = formData.type2.trim();

    if (!name || !image || !primaryType || !number) {
      return;
    }

    const alreadyExists = pokemonList.some(
      (pokemon) => pokemon.number === number,
    );

    if (alreadyExists) {
      alert("Esse número da Pokédex já foi cadastrado.");
      return;
    }

    const newPokemon = {
      id: crypto.randomUUID(),
      name,
      number,
      image,
      types: [primaryType, secondaryType].filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    setPokemonList((currentList) =>
      [...currentList, newPokemon].sort((firstPokemon, secondPokemon) => {
        return firstPokemon.number - secondPokemon.number;
      }),
    );
    setFormData(emptyForm);
  }

  function handleRemovePokemon(pokemonId) {
    setPokemonList((currentList) =>
      currentList.filter((pokemon) => pokemon.id !== pokemonId),
    );
  }

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Pokémon Go Collection</p>
          <h1>Minha Pokédex pessoal.</h1>
        </div>

        <div className="hero-stats">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Ativar tema ${theme === "light" ? "dark" : "light"}`}
            title={`Trocar para tema ${theme === "light" ? "dark" : "light"}`}
            aria-pressed={theme === "dark"}
          >
            <span
              className={`theme-toggle-thumb theme-toggle-thumb--${theme}`}
            />
            <img
              src={solrockIcon}
              alt=""
              className={`theme-toggle-image theme-toggle-image--solrock ${
                theme === "light" ? "is-active" : ""
              }`}
            />
            <img
              src={lunatoneIcon}
              alt=""
              className={`theme-toggle-image theme-toggle-image--lunatone ${
                theme === "dark" ? "is-active" : ""
              }`}
            />
          </button>

          <article className="stat-card">
            <span>Total registrado</span>
            <strong>{pokemonList.length}</strong>
          </article>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="panel capture-panel">
          <div className="panel-heading">
            <p className="section-label">Novo registro</p>
            <h2>Adicionar Pokémon</h2>
          </div>

          <form className="capture-form" onSubmit={handleSubmit}>
            <label>
              Número da Pokédex
              <div className="number-row">
                <input
                  type="number"
                  name="number"
                  min="1"
                  placeholder="Ex: 1"
                  value={formData.number}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleAutoFill}
                  disabled={isFetchingPokemon}
                >
                  {isFetchingPokemon ? "Buscando..." : "Auto preencher"}
                </button>
              </div>
            </label>

            {fetchMessage ? (
              <p className="fetch-message">{fetchMessage}</p>
            ) : null}

            <label>
              Nome
              <input
                type="text"
                name="name"
                placeholder="Ex: Bulbasaur"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              URL da imagem
              <input
                type="url"
                name="image"
                placeholder="https://..."
                value={formData.image}
                onChange={handleChange}
                required
              />
            </label>

            <div className="type-grid">
              <label>
                Tipo principal
                <input
                  type="text"
                  name="type1"
                  placeholder="Ex: Grass"
                  value={formData.type1}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Tipo secundário
                <input
                  type="text"
                  name="type2"
                  placeholder="Ex: Poison"
                  value={formData.type2}
                  onChange={handleChange}
                />
              </label>
            </div>

            <button type="submit" className="primary-button">
              Registrar captura
            </button>
          </form>
        </aside>

        <section className="panel collection-panel">
          <div className="panel-heading collection-heading">
            <div>
              <p className="section-label">Coleção</p>
              <h2>Seus cards</h2>
            </div>

            <label className="search-field">
              Buscar
              <input
                type="search"
                placeholder="Nome, numero ou tipo"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {filteredPokemon.length > 0 ? (
            <div className="card-grid">
              {filteredPokemon.map((pokemon) => (
                <article key={pokemon.id} className="pokemon-card">
                  <div className="card-topline">
                    <span>{formatDexNumber(pokemon.number)}</span>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleRemovePokemon(pokemon.id)}
                    >
                      Remover
                    </button>
                  </div>

                  <img
                    src={pokemon.image}
                    alt={`Imagem do Pokémon ${pokemon.name}`}
                    className="pokemon-image"
                  />

                  <div className="card-content">
                    <h3>{pokemon.name}</h3>
                    <div className="type-list">
                      {pokemon.types.map((type) => (
                        <span
                          key={`${pokemon.id}-${type}`}
                          className="type-pill"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>
                {pokemonList.length === 0
                  ? "Sua Pokédex ainda está vazia."
                  : "Nenhum Pokémon encontrado nessa busca."}
              </h3>
              <p>
                {pokemonList.length === 0
                  ? "Use o formulário ao lado para registrar sua primeira captura."
                  : "Tente buscar por outro nome, número ou tipo."}
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
