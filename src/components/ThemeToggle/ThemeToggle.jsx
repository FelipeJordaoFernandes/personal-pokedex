import { useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme.js";
import lunatoneIcon from "../../assets/lunatone.png";
import solrockIcon from "../../assets/solrock.png";
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const icons = useRef(null);

  useEffect(() => {
    // Decode both icons before they are needed, including the hidden one.
    for (const image of icons.current.querySelectorAll("img")) {
      image.decode().catch(() => {});
    }
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Tema: ${theme === "dark" ? "Escuro" : "Claro"}. Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
      title={`Ativar tema ${theme === "light" ? "escuro" : "claro"}`}
    >
      <span className="theme-toggle-icons" ref={icons} aria-hidden="true">
        <img
          src={solrockIcon}
          alt=""
          width="28"
          height="28"
          loading="eager"
          className="theme-toggle-image theme-toggle-light"
        />
        <img
          src={lunatoneIcon}
          alt=""
          width="28"
          height="28"
          loading="eager"
          className="theme-toggle-image theme-toggle-dark"
        />
      </span>
      <span className="theme-toggle-label">
        {theme === "dark" ? "Escuro" : "Claro"}
      </span>
    </button>
  );
}
