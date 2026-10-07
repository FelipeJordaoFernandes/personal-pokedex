import { useState } from "react";
import { fetchPokemonByNumber } from "../../services/pokeApi.js";
import { useHydrated } from "../../hooks/useHydrated.js";
const emptyForm = { name: "", number: "", image: "", type1: "", type2: "" };

export default function PokemonForm({
  onSubmitPokemon,
  feedback,
  onFeedbackChange,
}) {
  const hydrated = useHydrated();
  const [formData, setFormData] = useState(emptyForm);
  const [isFetching, setIsFetching] = useState(false);
  function handleChange(event) {
    const { name, value } = event.target;
    onFeedbackChange({ type: "", message: "" });
    setFormData((current) => ({ ...current, [name]: value }));
  }
  async function handleAutoFill() {
    const number = Number(formData.number);
    if (!Number.isSafeInteger(number) || number < 1) {
      onFeedbackChange({
        type: "error",
        message: "Digite um número inteiro maior que zero para buscar.",
      });
      document.getElementById("dex-number").focus();
      return;
    }
    setIsFetching(true);
    onFeedbackChange({
      type: "info",
      message: "Buscando os dados na PokeAPI…",
    });
    try {
      const data = await fetchPokemonByNumber(number);
      setFormData((current) => ({
        ...current,
        name: data.name,
        image: data.image ?? "",
        type1: data.types[0] ?? "",
        type2: data.types[1] ?? "",
      }));
      onFeedbackChange({
        type: "success",
        message: "Dados preenchidos. Confira e registre sua captura.",
      });
    } catch (error) {
      onFeedbackChange({
        type: "error",
        message:
          error.message === "Pokémon não encontrado."
            ? "Pokémon não encontrado. Confira o número ou preencha manualmente."
            : "Não foi possível acessar a PokeAPI. Tente novamente ou preencha manualmente.",
      });
    } finally {
      setIsFetching(false);
    }
  }
  function handleSubmit(event) {
    event.preventDefault();
    const name = formData.name.trim();
    const number = Number(formData.number);
    const image = formData.image.trim();
    const types = [
      ...new Set(
        [formData.type1.trim(), formData.type2.trim()].filter(Boolean),
      ),
    ];
    if (!name || !types.length || !Number.isSafeInteger(number) || number < 1) {
      onFeedbackChange({
        type: "error",
        message: "Confira o nome, o número e o tipo principal.",
      });
      return;
    }
    if (!image.startsWith("https://")) {
      onFeedbackChange({
        type: "error",
        message: "Use uma URL de imagem que comece com https://.",
      });
      document.getElementById("pokemon-image").focus();
      return;
    }
    if (onSubmitPokemon({ name, number, image, types })) {
      setFormData(emptyForm);
      document.getElementById("dex-number").focus();
    }
  }
  return (
    <form
      className="capture-form"
      onSubmit={handleSubmit}
      aria-label="Registrar captura"
      aria-busy={isFetching}
    >
      <fieldset disabled={isFetching || !hydrated}>
        <legend className="visually-hidden">Dados da captura</legend>
        <div>
          <label htmlFor="dex-number">Número da Pokédex</label>
          <div className="number-row">
            <input
              id="dex-number"
              type="number"
              name="number"
              min="1"
              step="1"
              placeholder="Ex.: 1"
              value={formData.number}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="secondary-button"
              onClick={handleAutoFill}
            >
              {isFetching ? "Buscando…" : "Preencher"}
            </button>
          </div>
        </div>
        <label>
          Nome
          <input
            type="text"
            name="name"
            autoComplete="off"
            placeholder="Ex.: Bulbasaur"
            value={formData.name}
            onChange={handleChange}
            maxLength="80"
            required
          />
        </label>
        <label htmlFor="pokemon-image">
          URL da imagem
          <input
            id="pokemon-image"
            type="url"
            name="image"
            autoComplete="off"
            placeholder="https://…"
            aria-describedby="image-hint"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </label>
        <p id="image-hint" className="form-hint">
          Use uma imagem HTTPS. A busca preenche este campo para você.
        </p>
        <div className="type-grid">
          <label>
            Tipo principal
            <input
              type="text"
              name="type1"
              placeholder="Ex.: Grass"
              value={formData.type1}
              onChange={handleChange}
              maxLength="30"
              required
            />
          </label>
          <label>
            <span>
              Tipo secundário <span className="optional">(opcional)</span>
            </span>
            <input
              type="text"
              name="type2"
              placeholder="Ex.: Poison"
              value={formData.type2}
              onChange={handleChange}
              maxLength="30"
            />
          </label>
        </div>
        <button type="submit" className="primary-button">
          Registrar captura
        </button>
      </fieldset>
      <p
        className={`form-message form-message--${feedback.type || "info"}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {feedback.message}
      </p>
    </form>
  );
}
