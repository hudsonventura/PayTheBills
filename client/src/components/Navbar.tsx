import React from 'react';
import { type Language, translations } from '../i18n';
import { type User } from '../api';

interface NavbarProps {
  user: User | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onLogout,
  onToggleSidebar,
}) => {
  const t = translations[language];

  return (
    <header className="navbar">
      <div className="navbar-left">
        {user && (
          <button
            type="button"
            className="navbar-hamburger-btn"
            onClick={onToggleSidebar}
            title="Menu"
          >
            ☰
          </button>
        )}

        <div className="navbar-brand">
          <div className="navbar-logo">
            <img src="/icon.svg" alt="PayTheBills" width="30" height="30" />
          </div>
          <div>
            <span className="navbar-title">{t.appTitle}</span>
            <span className="navbar-subtitle">{t.appSubtitle}</span>
          </div>
        </div>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="btn btn-outline btn-sm lang-btn"
          onClick={() => onLanguageChange(language === 'pt' ? 'en' : 'pt')}
          title="Toggle Language"
        >
          🌐 {language.toUpperCase()}
        </button>

        {user && (
          <div className="user-profile">
            <span className="user-name">
              {t.welcomeUser.replace('{name}', user.name)}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onLogout}
            >
              {t.logout}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
