import lunatoneIcon from "../../assets/lunatone.png";
import solrockIcon from "../../assets/solrock.png";
export default function ThemeToggle({ theme, onToggleTheme }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggleTheme}
      aria-label={`Tema: ${theme === "dark" ? "Escuro" : "Claro"}. Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
      title={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
    >
      <img
        src={theme === "dark" ? lunatoneIcon : solrockIcon}
        alt=""
        width="28"
        height="28"
        className="theme-toggle-image"
      />
      <span>{theme === "dark" ? "Escuro" : "Claro"}</span>
    </button>
  );
}
