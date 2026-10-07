import ThemeToggle from "../ThemeToggle/ThemeToggle.jsx";
import BrandMark from "../BrandMark.jsx";
export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="Personal Pokédex — início">
        <BrandMark />
        Personal Pokédex
      </a>
      <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
    </header>
  );
}
