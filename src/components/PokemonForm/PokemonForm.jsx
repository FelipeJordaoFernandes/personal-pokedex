import { useState } from "react";
import { fetchPokemonByNumber } from "../../services/pokeApi.js";

const emptyForm = {
  name: "",
  number: "",
  image: "",
  type1: "",
  type2: "",
};

function PokemonForm({ onSubmitPokemon, feedback, onFeedbackChange }) {
  const [formData, setFormData] = useState(emptyForm);
  const [isFetchingPokemon, setIsFetchingPokemon] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    if (name === "number") {
      onFeedbackChange({ type: "", message: "" });
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleAutoFill() {
    const number = Number(formData.number);

    if (!number) {
      onFeedbackChange({
        type: "error",
        message: "Digite um número da Pokédex para buscar.",
      });
      return;
    }

    setIsFetchingPokemon(true);
    onFeedbackChange({ type: "", message: "" });

    try {
      const pokemonData = await fetchPokemonByNumber(number);

      setFormData((currentData) => ({
        ...currentData,
        name: pokemonData.name,
        image: pokemonData.image ?? currentData.image,
        type1: pokemonData.types[0] ?? "",
        type2: pokemonData.types[1] ?? "",
      }));
    } catch {
      onFeedbackChange({
        type: "error",
        message: "Não foi possível buscar esse Pokémon agora.",
      });
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

    const hasAdded = onSubmitPokemon({
      name,
      number,
      image,
      types: [primaryType, secondaryType].filter(Boolean),
    });

    if (hasAdded) {
      setFormData(emptyForm);
    }
  }

  return (
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

      {feedback.message ? (
        <p className={`form-message form-message--${feedback.type || "info"}`}>
          {feedback.message}
        </p>
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
  );
}

export default PokemonForm;
