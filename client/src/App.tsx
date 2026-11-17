import { useState, useEffect, useCallback } from 'react';
import { detectBrowserLanguage, type Language } from './i18n';
import { api, getAuthToken, removeAuthToken, type User } from './api';
import { Navbar } from './components/Navbar';
import { Sidebar, type AppRoute } from './components/Sidebar';
import { AuthView } from './components/AuthView';
import { BillsList } from './components/BillsList';
import { BillsManagement } from './components/BillsManagement';
import { MonthlyComparisonView } from './components/MonthlyComparisonView';
import { CreditCardGanttView } from './components/CreditCardGanttView';
import { CreditCardPurchasesView } from './components/CreditCardPurchasesView';
import { CreditCardsManagement } from './components/CreditCardsManagement';
import './App.css';

const parseHashRoute = (): AppRoute => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const validRoutes: AppRoute[] = [
    'executions',
    'bills',
    'comparison',
    'cards/gantt',
    'cards/purchases',
    'cards/manage',
  ];
  return validRoutes.includes(hash as AppRoute) ? (hash as AppRoute) : 'executions';
};

function App() {
  const [language, setLanguage] = useState<Language>(() => detectBrowserLanguage());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!getAuthToken());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseHashRoute());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('paythebills_language', lang);
    } catch {
      // ignore
    }
  };

  const handleRouteChange = useCallback((route: AppRoute) => {
    window.location.hash = route;
    setCurrentRoute(route);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentRoute(parseHashRoute());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    api.getMe()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        removeAuthToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
        <p>{language === 'pt' ? 'Carregando...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className={`app-root ${user ? 'has-sidebar' : 'no-sidebar'} ${isSidebarOpen ? 'sidebar-expanded' : 'sidebar-mini'}`}>
      {user && (
        <Sidebar
          user={user}
          language={language}
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          onLanguageChange={handleLanguageChange}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}

      <div className="app-main-wrapper">
        <Navbar
          user={user}
          language={language}
          onLanguageChange={handleLanguageChange}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="main-content">
          {!user ? (
            <AuthView language={language} onSuccess={(u) => setUser(u)} />
          ) : currentRoute === 'executions' ? (
            <BillsList
              language={language}
              onNavigateToBills={() => handleRouteChange('bills')}
            />
          ) : currentRoute === 'bills' ? (
            <BillsManagement language={language} />
          ) : currentRoute === 'comparison' ? (
            <MonthlyComparisonView language={language} />
          ) : currentRoute === 'cards/gantt' ? (
            <CreditCardGanttView
              language={language}
              onNavigateToCards={() => handleRouteChange('cards/manage')}
              onNavigateToPurchases={() => handleRouteChange('cards/purchases')}
            />
          ) : currentRoute === 'cards/purchases' ? (
            <CreditCardPurchasesView
              language={language}
              onNavigateToCards={() => handleRouteChange('cards/manage')}
            />
          ) : (
            <CreditCardsManagement language={language} />
          )}
        </main>

        <footer className="app-footer">
          <p>PayTheBills &copy; 2026 - {language === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
