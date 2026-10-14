import { useState } from "react";
import { Menu, Users, X } from "lucide-react";
import Brand from "../shared/Brand.jsx";

const navLinks = [
  ["About", "/about"],
  ["Academics", "#programs"],
  ["Admissions", "#admissions"],
  ["Research", "#impact"],
  ["Campus Life", "#campus"],
  ["News & Events", "#news"],
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const isHome = pathname === "/" || pathname === "/home";
  const sectionHref = (id) => (isHome ? `#${id}` : `/#${id}`);
  return (
    <header className="site-header" id="top">
      <div className="nav-wrap">
        <Brand />
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav
          className={menuOpen ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
        >
          <a
            className={isHome ? "nav-home is-current" : "nav-home"}
            aria-current={isHome ? "page" : undefined}
            href={isHome ? "#top" : "/"}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>
          {navLinks.map(([label, href]) => {
            const target = href.startsWith("#")
              ? sectionHref(href.slice(1))
              : href;
            const active =
              (label === "About" && pathname === "/about") ||
              (label === "Admissions" && pathname === "/admissions");
            return (
              <a
                key={label}
                className={active ? "is-current" : undefined}
                aria-current={active ? "page" : undefined}
                href={target}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            );
          })}
        </nav>
        <div className="nav-actions">
          <a className="portal-link" href="/login">
            Student Portal
          </a>
          <a className="button button-small button-navy" href="/signup">
            Apply Now
          </a>
          <a
            className="avatar"
            href="/login"
            aria-label="Sign in to your account"
          >
            <Users size={15} />
          </a>
        </div>
      </div>
    </header>
  );
}
