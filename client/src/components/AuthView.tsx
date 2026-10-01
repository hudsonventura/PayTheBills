import React, { useState } from 'react';
import { type Language, translations } from '../i18n';
import { api, setAuthToken, type User } from '../api';

interface AuthViewProps {
  language: Language;
  onSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ language, onSuccess }) => {
  const t = translations[language];
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!name.trim()) {
        setError(language === 'pt' ? 'Informe seu nome completo.' : 'Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordsMismatch);
        return;
      }
      if (password.length < 5) {
        setError(
          language === 'pt'
            ? 'A senha deve ter pelo menos 5 caracteres.'
            : 'Password must be at least 5 characters.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        setAuthToken(res.token);
        onSuccess({ id: res.id, name: res.name, email: res.email });
      } else {
        const res = await api.login({
          email: email.trim(),
          password,
        });
        setAuthToken(res.token);
        onSuccess({ id: res.id, name: res.name, email: res.email });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isRegister ? t.registerTitle : t.loginTitle}</h2>
          <p className="auth-subtitle">
            {isRegister ? t.register : t.login} - {t.appTitle}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
          >
            {t.login}
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
          >
            {t.register}
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-name">{t.name}</label>
              <input
                id="auth-name"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hudson Ventura"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">{t.email}</label>
            <input
              id="auth-email"
              type="text"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">{t.password}</label>
            <input
              id="auth-password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={5}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password">{t.confirmPassword}</label>
              <input
                id="auth-confirm-password"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={5}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? t.loading : isRegister ? t.register : t.login}
          </button>
        </form>

        <div className="auth-footer">
          {isRegister ? (
            <p>
              {t.alreadyHaveAccount}{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
              >
                {t.loginPrompt}
              </button>
            </p>
          ) : (
            <p>
              {t.dontHaveAccount}{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
              >
                {t.createAccountPrompt}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
