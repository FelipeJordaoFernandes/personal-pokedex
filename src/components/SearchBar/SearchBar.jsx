export default function SearchBar({ search, onSearchChange }) {
  return (
    <label className="search-field">
      <span className="visually-hidden">Buscar na coleção</span>
      <span className="search-input-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="search"
          placeholder="Buscar por nome, número ou tipo"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </span>
    </label>
  );
}
