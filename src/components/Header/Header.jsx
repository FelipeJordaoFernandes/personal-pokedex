import ThemeToggle from "../ThemeToggle/ThemeToggle.jsx";
import BrandMark from "../BrandMark.jsx";
export default function Header() {
  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="Personal Pokédex — início">
        <BrandMark />
        Personal Pokédex
      </a>
      <ThemeToggle />
    </header>
  );
}
