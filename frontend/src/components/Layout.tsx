import {
  Bell,
  FileChartColumn,
  Languages,
  LayoutDashboard,
  Sprout,
  Waves
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { PlotSwitcher } from "../components/PlotSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useI18n } from "../i18n";

export function Layout() {
  const { language, setLanguage } = useLanguage();
  const t = useI18n();

  const navItems = [
    { to: "/", label: t.nav.dashboard, icon: LayoutDashboard },
    { to: "/sensors", label: t.nav.sensors, icon: Waves },
    { to: "/alerts", label: t.nav.alerts, icon: Bell },
    { to: "/reports", label: t.nav.reports, icon: FileChartColumn }
  ];

  return (
    <div className="app-shell">
      <header className="topbar card">
        <div className="brand-block">
          <div className="brand-icon-wrap">
            <Sprout size={20} />
          </div>
          <div>
            <p className="brand-name">{t.appName}</p>
            <p className="brand-tagline">{t.tagline}</p>
          </div>
        </div>

        <div className="language-switch" role="group" aria-label={t.languageLabel}>
          <span className="language-label">
            <Languages size={16} />
            {t.languageLabel}
          </span>
          <button
            type="button"
            className={language === "fr" ? "lang-btn is-active" : "lang-btn"}
            onClick={() => setLanguage("fr")}
          >
            FR
          </button>
          <button
            type="button"
            className={language === "ar" ? "lang-btn is-active" : "lang-btn"}
            onClick={() => setLanguage("ar")}
          >
            AR
          </button>
        </div>
      </header>

      <PlotSwitcher />

      <nav className="nav-grid">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
