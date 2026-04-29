import { formatDexNumber } from "../../services/pokeApi.js";

function PokemonCard({ pokemon, onRemove }) {
  return (
    <article className="pokemon-card">
      <div className="card-topline">
        <span>{formatDexNumber(pokemon.number)}</span>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onRemove(pokemon.id)}
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
            <span key={`${pokemon.id}-${type}`} className="type-pill">
              {type}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default PokemonCard;
