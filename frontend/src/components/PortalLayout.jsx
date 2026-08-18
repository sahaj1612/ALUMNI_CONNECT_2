import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function PortalLayout({
  title,
  section,
  onSectionChange,
  navigation,
  children,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("alumniconnect-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("alumniconnect-theme", theme);
  }, [theme]);

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        {navigation.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`portal-nav-link ${section === item.key ? "is-active" : ""}`}
            onClick={() => onSectionChange(item.key)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <p className="eyebrow">SDMCET AlumniConnect</p>
            <h1>{title}</h1>
          </div>
          <div className="inline-actions">
            <button
              type="button"
              className="theme-toggle"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7.2 7.2 0 1 0 9.8 9.8Z" />
              </svg>
            </button>
            <Link to="/" className="ghost-link">
              Back to Home
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
