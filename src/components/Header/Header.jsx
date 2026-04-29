import ThemeToggle from "../ThemeToggle/ThemeToggle.jsx";

function Header({ pokemonCount, theme, onToggleTheme }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">Pokémon Go Collection</p>
        <h1>Minha Pokédex pessoal.</h1>
      </div>

      <div className="hero-stats">
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />

        <article className="stat-card">
          <span>Total registrado</span>
          <strong>{pokemonCount}</strong>
        </article>
      </div>
    </section>
  );
}

export default Header;
