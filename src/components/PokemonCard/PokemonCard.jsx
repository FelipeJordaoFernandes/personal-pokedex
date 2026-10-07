import { useState } from "react";
import { formatDexNumber } from "../../services/pokeApi.js";
import BrandMark from "../BrandMark.jsx";
export default function PokemonCard({ pokemon, onRemove }) {
  const [failedImage, setFailedImage] = useState(false);
  return (
    <article
      className="pokemon-card"
      aria-label={`${pokemon.name}, ${formatDexNumber(pokemon.number)}`}
    >
      <div className="card-topline">
        <span>{formatDexNumber(pokemon.number)}</span>
        <button
          type="button"
          className="ghost-button"
          onClick={() => onRemove(pokemon.id)}
          aria-label={`Remover ${pokemon.name}`}
          title={`Remover ${pokemon.name}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="pokemon-image-wrap">
        {failedImage ? (
          <span className="image-fallback">
            <BrandMark />
            Imagem indisponível
          </span>
        ) : (
          <img
            src={pokemon.image}
            alt={pokemon.name}
            className="pokemon-image"
            width="148"
            height="148"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailedImage(true)}
          />
        )}
      </div>
      <div className="card-content">
        <h3>{pokemon.name}</h3>
        <div className="type-list">
          {pokemon.types.map((type) => (
            <span key={type} className="type-pill">
              {type}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
