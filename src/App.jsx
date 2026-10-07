import { useState } from "react";
import Header from "./components/Header/Header.jsx";
import BrandMark from "./components/BrandMark.jsx";
import PokemonForm from "./components/PokemonForm/PokemonForm.jsx";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import PokemonCard from "./components/PokemonCard/PokemonCard.jsx";
import { usePokemonCollection } from "./hooks/usePokemonCollection.js";
import "./App.css";

export default function App() {
  const {
    pokemonList,
    filteredPokemon,
    search,
    setSearch,
    addPokemon,
    removePokemon,
    storageMessage,
  } = usePokemonCollection();
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [collectionMessage, setCollectionMessage] = useState("");
  function handleAddPokemon(data) {
    const result = addPokemon(data);
    setFeedback({
      type: result.ok ? "success" : "error",
      message: result.ok
        ? `${data.name} registrado na sua coleção.`
        : result.message,
    });
    return result.ok;
  }
  function handleRemovePokemon(id) {
    const name = pokemonList.find((pokemon) => pokemon.id === id)?.name;
    removePokemon(id);
    setCollectionMessage(`${name} removido da coleção.`);
    document.querySelector("#collection-title")?.focus();
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#collection-title">
        Pular para a coleção
      </a>
      <Header />
      <main id="main-content">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Seu diário de capturas</p>
            <h1 id="page-title">
              Sua jornada.
              <br />
              <span>Sua Pokédex.</span>
            </h1>
            <p className="hero-description">
              Cada Pokémon tem uma história. Guarde suas capturas e reúna seus
              favoritos em um só lugar.
            </p>
            <a className="collection-jump" href="#collection-title">
              Explorar minha coleção{" "}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M12 4v16m-6-6 6 6 6-6" />
              </svg>
            </a>
          </div>
          <div className="hero-stats">
            <BrandMark />
            <strong>{String(pokemonList.length).padStart(2, "0")}</strong>
            <span>Pokémon na coleção</span>
            <p>Uma captura de cada vez.</p>
          </div>
        </section>
        <div className="dashboard-grid">
          <section className="capture-panel" aria-labelledby="capture-title">
            <div className="panel-heading">
              <p className="section-label">Nova descoberta</p>
              <h2 id="capture-title">Registrar captura</h2>
              <p className="panel-description">
                Busque pelo número da Pokédex ou preencha os dados do seu jeito.
              </p>
            </div>
            <PokemonForm
              onSubmitPokemon={handleAddPokemon}
              feedback={feedback}
              onFeedbackChange={setFeedback}
            />
          </section>
          <section
            className="collection-panel"
            aria-labelledby="collection-title"
          >
            <div className="panel-heading collection-heading">
              <div>
                <p className="section-label">Suas descobertas</p>
                <div className="collection-title">
                  <h2 id="collection-title" tabIndex="-1">
                    Minha coleção
                  </h2>
                  <span className="count-badge">
                    {pokemonList.length}
                    <span className="visually-hidden"> registros</span>
                  </span>
                </div>
              </div>
            </div>
            <SearchBar search={search} onSearchChange={setSearch} />
            <p className="visually-hidden" role="status">
              {collectionMessage}
            </p>
            {storageMessage && (
              <p className="form-message form-message--error" role="alert">
                {storageMessage}
              </p>
            )}
            {pokemonList.length > 0 && (
              <p className="results-label" role="status">
                {filteredPokemon.length} de {pokemonList.length}{" "}
                {pokemonList.length === 1 ? "registro" : "registros"}
              </p>
            )}
            {filteredPokemon.length > 0 ? (
              <div className="card-grid">
                {filteredPokemon.map((pokemon) => (
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onRemove={handleRemovePokemon}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BrandMark />
                <h3>
                  {pokemonList.length === 0
                    ? "Toda jornada tem um primeiro Pokémon."
                    : "Nenhuma captura por aqui."}
                </h3>
                <p>
                  {pokemonList.length === 0
                    ? "Registre sua primeira captura e comece a construir sua coleção."
                    : "Tente outro nome, número ou tipo para encontrar seu Pokémon."}
                </p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    if (pokemonList.length === 0)
                      document.getElementById("dex-number")?.focus();
                    else {
                      setSearch("");
                      document.querySelector('input[type="search"]')?.focus();
                    }
                  }}
                >
                  {pokemonList.length === 0
                    ? "Registrar meu primeiro Pokémon"
                    : "Limpar busca"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <p>Personal Pokédex · Sua coleção fica neste navegador.</p>
        <p>
          Dados por{" "}
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">
            PokeAPI
          </a>
          . Projeto pessoal, sem vínculo com a Nintendo.
        </p>
      </footer>
    </div>
  );
}
