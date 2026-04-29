import { useState } from "react";
import Header from "./components/Header/Header.jsx";
import PokemonForm from "./components/PokemonForm/PokemonForm.jsx";
import SearchBar from "./components/SearchBar/SearchBar.jsx";
import PokemonCard from "./components/PokemonCard/PokemonCard.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { usePokemonCollection } from "./hooks/usePokemonCollection.js";
import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    pokemonList,
    filteredPokemon,
    search,
    setSearch,
    addPokemon,
    removePokemon,
  } = usePokemonCollection();
  const [formFeedback, setFormFeedback] = useState({
    type: "",
    message: "",
  });

  function handleAddPokemon(pokemonData) {
    const result = addPokemon(pokemonData);

    if (!result.ok) {
      setFormFeedback({
        type: "error",
        message: "Esse número da Pokédex já foi cadastrado.",
      });
      return false;
    }

    setFormFeedback({
      type: "success",
      message: "Pokémon registrado com sucesso.",
    });
    return true;
  }

  function handleFormFeedback(feedback) {
    setFormFeedback(feedback);
  }

  return (
    <main className="app-shell">
      <Header
        pokemonCount={pokemonList.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <section className="dashboard-grid">
        <aside className="panel capture-panel">
          <div className="panel-heading">
            <p className="section-label">Novo registro</p>
            <h2>Adicionar Pokémon</h2>
          </div>

          <PokemonForm
            onSubmitPokemon={handleAddPokemon}
            feedback={formFeedback}
            onFeedbackChange={handleFormFeedback}
          />
        </aside>

        <section className="panel collection-panel">
          <div className="panel-heading collection-heading">
            <div>
              <p className="section-label">Coleção</p>
              <h2>Seus cards</h2>
            </div>

            <SearchBar search={search} onSearchChange={setSearch} />
          </div>

          {filteredPokemon.length > 0 ? (
            <div className="card-grid">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onRemove={removePokemon}
                />
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
