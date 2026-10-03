import React from 'react';
import { type Language, translations } from '../i18n';
import { type User } from '../api';

interface NavbarProps {
  user: User | null;
  language: Language;
  currentView: 'executions' | 'bills' | 'comparison';
  onViewChange: (view: 'executions' | 'bills' | 'comparison') => void;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  currentView,
  onViewChange,
  onLanguageChange,
  onLogout,
}) => {
  const t = translations[language];

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <img src="/favicon.svg" alt="PayTheBills" width="30" height="30" />
          </div>
          <div>
            <span className="navbar-title">{t.appTitle}</span>
            <span className="navbar-subtitle">{t.appSubtitle}</span>
          </div>
        </div>

        {user && (
          <nav className="navbar-nav">
            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'executions' ? 'active' : ''}`}
              onClick={() => onViewChange('executions')}
            >
              📋 {t.navExecutions}
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'bills' ? 'active' : ''}`}
              onClick={() => onViewChange('bills')}
            >
              📝 {t.navBills}
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${currentView === 'comparison' ? 'active' : ''}`}
              onClick={() => onViewChange('comparison')}
            >
              📊 {t.navComparison}
            </button>
          </nav>
        )}
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
