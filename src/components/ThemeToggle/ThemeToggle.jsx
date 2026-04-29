import lunatoneIcon from "../../assets/lunatone.png";
import solrockIcon from "../../assets/solrock.png";

function ThemeToggle({ theme, onToggleTheme }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggleTheme}
      aria-label={`Ativar tema ${theme === "light" ? "dark" : "light"}`}
      title={`Trocar para tema ${theme === "light" ? "dark" : "light"}`}
      aria-pressed={theme === "dark"}
    >
      <span className={`theme-toggle-thumb theme-toggle-thumb--${theme}`} />
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
  );
}

export default ThemeToggle;
