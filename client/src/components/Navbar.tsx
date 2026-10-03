import React from 'react';
import { type Language, translations } from '../i18n';
import { type User } from '../api';

interface NavbarProps {
  user: User | null;
  language: Language;
  currentView: 'executions' | 'bills';
  onViewChange: (view: 'executions' | 'bills') => void;
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
              <path d="m9 16 2 2 4-4"/>
            </svg>
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
