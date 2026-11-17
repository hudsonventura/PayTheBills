import React, { useState, useEffect, useCallback } from 'react';
import { type Language, translations, formatCurrency } from '../i18n';
import { api, type CreditCard, type CreateCreditCardPayload, type UpdateCreditCardPayload } from '../api';
import { CreditCardModal } from './CreditCardModal';

interface CreditCardsManagementProps {
  language: Language;
}

export const CreditCardsManagement: React.FC<CreditCardsManagementProps> = ({ language }) => {
  const t = translations[language];

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCreditCards();
      setCards(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleOpenAdd = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateCreditCardPayload | UpdateCreditCardPayload) => {
    if (editingCard) {
      await api.updateCreditCard(editingCard.id, data);
    } else {
      await api.createCreditCard(data);
    }
    await loadCards();
  };

  const handleDelete = async (card: CreditCard) => {
    const confirmMsg = t.confirmDeleteCard.replace('{name}', card.name);
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteCreditCard(card.id);
      await loadCards();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting card');
    }
  };

  return (
    <div className="cards-management-container">
      <div className="view-header">
        <div>
          <h2>💳 {t.cardsTitle}</h2>
          <p className="view-subtitle">{t.cardsSubtitle}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          + {t.addCard}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>{t.loading}</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">💳</div>
          <h3>{t.noCardsFound}</h3>
          <p>{t.noCardsPrompt}</p>
          <button type="button" className="btn btn-primary mt-3" onClick={handleOpenAdd}>
            + {t.addCard}
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card) => {
            const cardBg = card.color || '#4F46E5';
            return (
              <div key={card.id} className="credit-card-item">
                <div className="credit-card-visual" style={{ backgroundColor: cardBg }}>
                  <div className="card-top-row">
                    <span className="card-chip-symbol">💳</span>
                    <span className="card-badge-pill">
                      {language === 'pt' ? 'Crédito' : 'Credit'}
                    </span>
                  </div>
                  <div className="card-visual-name">{card.name}</div>
                  <div className="card-bottom-row">
                    <div className="card-date-col">
                      <span className="date-label">{language === 'pt' ? 'Fechamento' : 'Closes'}</span>
                      <span className="date-val">{language === 'pt' ? `Dia ${card.closingDay}` : `Day ${card.closingDay}`}</span>
                    </div>
                    <div className="card-date-col">
                      <span className="date-label">{language === 'pt' ? 'Vencimento' : 'Due'}</span>
                      <span className="date-val">{language === 'pt' ? `Dia ${card.dueDay}` : `Day ${card.dueDay}`}</span>
                    </div>
                  </div>
                </div>

                <div className="credit-card-details">
                  <div className="card-stat-row">
                    <span className="stat-label">{t.activePurchases}:</span>
                    <span className="stat-value badge-count">{card.activePurchasesCount}</span>
                  </div>
                  <div className="card-stat-row">
                    <span className="stat-label">{t.totalRemaining}:</span>
                    <span className="stat-value highlight-amount">
                      {formatCurrency(card.totalRemainingAmount, language)}
                    </span>
                  </div>

                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenEdit(card)}
                    >
                      ✏️ {t.edit}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(card)}
                    >
                      🗑️ {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <CreditCardModal
          language={language}
          card={editingCard}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
