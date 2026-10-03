import { useState, useEffect } from 'react';
import { detectBrowserLanguage, type Language } from './i18n';
import { api, getAuthToken, removeAuthToken, type User } from './api';
import { Navbar } from './components/Navbar';
import { AuthView } from './components/AuthView';
import { BillsList } from './components/BillsList';
import { BillsManagement } from './components/BillsManagement';
import './App.css';

function App() {
  const [language, setLanguage] = useState<Language>(() => detectBrowserLanguage());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => !!getAuthToken());
  const [currentView, setCurrentView] = useState<'executions' | 'bills'>('executions');

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('paythebills_language', lang);
    } catch {
      // ignore
    }
  };

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
    <div className="app-layout">
      <Navbar
        user={user}
        language={language}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {!user ? (
          <AuthView language={language} onSuccess={(u) => setUser(u)} />
        ) : currentView === 'executions' ? (
          <BillsList
            language={language}
            onNavigateToBills={() => setCurrentView('bills')}
          />
        ) : (
          <BillsManagement language={language} />
        )}
      </main>

      <footer className="app-footer">
        <p>PayTheBills &copy; 2026 - {language === 'pt' ? 'Todos os direitos reservados' : 'All rights reserved'}</p>
      </footer>
    </div>
  );
}

export default App;

