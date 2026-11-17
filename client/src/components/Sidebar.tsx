import React, { useState, useRef, useEffect } from 'react';
import { type Language, translations } from '../i18n';
import { type User } from '../api';

export type AppRoute =
  | 'executions'
  | 'bills'
  | 'comparison'
  | 'cards/gantt'
  | 'cards/purchases'
  | 'cards/manage';

interface SidebarProps {
  user: User | null;
  language: Language;
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  language,
  currentRoute,
  onRouteChange,
  onLanguageChange,
  onLogout,
  isOpen,
  onToggleOpen,
}) => {
  const t = translations[language];
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (logoutDropdownRef.current && !logoutDropdownRef.current.contains(e.target as Node)) {
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogoutConfirm]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onToggleOpen} />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => onRouteChange('executions')}>
            <img src="/icon.svg" alt="PayTheBills" width="34" height="34" className="sidebar-logo" />
            <div className="sidebar-brand-text">
              <span className="sidebar-title">{t.appTitle}</span>
              <span className="sidebar-subtitle">{t.appSubtitle}</span>
            </div>
          </div>
        </div>

        {user && (
          <nav className="sidebar-nav">
            {/* Seção 1: Contas & Recorrências */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">
                <span>{t.sectionBills}</span>
              </div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'executions' ? 'active' : ''}`}
                    onClick={() => onRouteChange('executions')}
                  >
                    <span className="menu-icon">📋</span>
                    <span className="menu-label">{t.navExecutions}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'bills' ? 'active' : ''}`}
                    onClick={() => onRouteChange('bills')}
                  >
                    <span className="menu-icon">📝</span>
                    <span className="menu-label">{t.navBills}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'comparison' ? 'active' : ''}`}
                    onClick={() => onRouteChange('comparison')}
                  >
                    <span className="menu-icon">📊</span>
                    <span className="menu-label">{t.navComparison}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Seção 2: Cartão de Crédito */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">
                <span>{t.sectionCards}</span>
              </div>
              <ul className="sidebar-menu">
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'cards/gantt' ? 'active' : ''}`}
                    onClick={() => onRouteChange('cards/gantt')}
                  >
                    <span className="menu-icon">📈</span>
                    <span className="menu-label">{t.navGantt}</span>
                    <span className="menu-badge new">Novo</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'cards/purchases' ? 'active' : ''}`}
                    onClick={() => onRouteChange('cards/purchases')}
                  >
                    <span className="menu-icon">🛍️</span>
                    <span className="menu-label">{t.navPurchases}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`sidebar-menu-item ${currentRoute === 'cards/manage' ? 'active' : ''}`}
                    onClick={() => onRouteChange('cards/manage')}
                  >
                    <span className="menu-icon">💳</span>
                    <span className="menu-label">{t.navCards}</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        )}

        {/* Sidebar Footer with User info & Language */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <button
              type="button"
              className="sidebar-lang-btn"
              onClick={() => onLanguageChange(language === 'pt' ? 'en' : 'pt')}
              title="Toggle Language"
            >
              🌐 {language.toUpperCase()}
            </button>
          </div>

          {user && (
            <div className="sidebar-user-block">
              <div className="sidebar-user-info">
                <span className="sidebar-user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <div className="sidebar-user-details">
                  <span className="sidebar-user-name">{user.name}</span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
              </div>

              <div className="sidebar-logout-wrapper" ref={logoutDropdownRef}>
                <button
                  type="button"
                  className={`sidebar-logout-btn ${showLogoutConfirm ? 'active' : ''}`}
                  onClick={() => setShowLogoutConfirm((prev) => !prev)}
                  title={t.logout}
                  aria-expanded={showLogoutConfirm}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>

                {showLogoutConfirm && (
                  <div className="logout-confirm-dropdown">
                    <p className="logout-confirm-text">
                      {language === 'pt' ? 'Deseja realmente sair?' : 'Are you sure you want to log out?'}
                    </p>
                    <div className="logout-confirm-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          onLogout();
                        }}
                      >
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
