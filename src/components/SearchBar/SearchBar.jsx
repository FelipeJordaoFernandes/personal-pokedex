function SearchBar({ search, onSearchChange }) {
  return (
    <label className="search-field">
      Buscar
      <input
        type="search"
        placeholder="Nome, número ou tipo"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </label>
  );
}

export default SearchBar;
