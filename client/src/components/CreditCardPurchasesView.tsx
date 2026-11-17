import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Language, translations, formatCurrency, formatDate } from '../i18n';
import {
  api,
  type CreditCard,
  type CreditCardPurchase,
  type CreateCreditCardPurchasePayload,
  type UpdateCreditCardPurchasePayload,
} from '../api';
import { CreditCardPurchaseModal } from './CreditCardPurchaseModal';

interface CreditCardPurchasesViewProps {
  language: Language;
  onNavigateToCards?: () => void;
}

export const CreditCardPurchasesView: React.FC<CreditCardPurchasesViewProps> = ({
  language,
  onNavigateToCards,
}) => {
  const t = translations[language];

  const [purchases, setPurchases] = useState<CreditCardPurchase[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<CreditCardPurchase | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsData, purchasesData] = await Promise.all([
        api.getCreditCards(),
        api.getCreditCardPurchases(selectedCardId === 'all' ? undefined : selectedCardId),
      ]);
      setCards(cardsData);
      setPurchases(purchasesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading purchases');
    } finally {
      setLoading(false);
    }
  }, [selectedCardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    if (cards.length === 0) {
      if (window.confirm(language === 'pt'
        ? 'Você precisa cadastrar um cartão de crédito primeiro. Deseja ir para Meus Cartões?'
        : 'You need to register a credit card first. Go to My Cards?')) {
        onNavigateToCards?.();
      }
      return;
    }
    setEditingPurchase(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: CreditCardPurchase) => {
    setEditingPurchase(p);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateCreditCardPurchasePayload | UpdateCreditCardPurchasePayload) => {
    if (editingPurchase) {
      await api.updateCreditCardPurchase(editingPurchase.id, data as UpdateCreditCardPurchasePayload);
    } else {
      await api.createCreditCardPurchase(data as CreateCreditCardPurchasePayload);
    }
    await loadData();
  };

  const handleDelete = async (p: CreditCardPurchase) => {
    const confirmMsg = t.confirmDeletePurchase.replace('{title}', p.title);
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.deleteCreditCardPurchase(p.id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting purchase');
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (statusFilter === 'active' && p.isCompleted) return false;
      if (statusFilter === 'completed' && !p.isCompleted) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesCard = p.creditCardName.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCard) return false;
      }
      return true;
    });
  }, [purchases, statusFilter, searchTerm]);

  return (
    <div className="purchases-view-container">
      <div className="view-header">
        <div>
          <h2>🛍️ {t.purchasesTitle}</h2>
          <p className="view-subtitle">{t.purchasesSubtitle}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          + {t.addPurchase}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter and search bar */}
      <div className="purchases-filters-bar card">
        <div className="filter-item">
          <label htmlFor="search-purchase">{language === 'pt' ? 'Buscar:' : 'Search:'}</label>
          <input
            id="search-purchase"
            type="text"
            className="form-control form-control-sm"
            placeholder={language === 'pt' ? 'Filtrar por item ou cartão...' : 'Filter by item or card...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="card-filter">{t.filterByCard}</label>
          <select
            id="card-filter"
            className="form-control form-control-sm"
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
          >
            <option value="all">{t.allCards}</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>{language === 'pt' ? 'Status:' : 'Status:'}</label>
          <div className="status-tabs-pill">
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              {language === 'pt' ? 'Todos' : 'All'}
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              {t.statusActive}
            </button>
            <button
              type="button"
              className={`pill-btn ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              {t.statusCompleted}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>{t.loading}</p>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🛍️</div>
          <h3>{t.noPurchasesFound}</h3>
          <p>{t.noPurchasesPrompt}</p>
          <button type="button" className="btn btn-primary mt-3" onClick={handleOpenAdd}>
            + {t.addPurchase}
          </button>
        </div>
      ) : (
        <div className="purchases-table-card card">
          <div className="table-responsive">
            <table className="table purchases-table">
              <thead>
                <tr>
                  <th>{t.purchaseTitle}</th>
                  <th>{language === 'pt' ? 'Cartão' : 'Card'}</th>
                  <th>{t.purchaseDate}</th>
                  <th>{t.totalAmount}</th>
                  <th>{t.totalInstallments}</th>
                  <th>{t.installmentProgress}</th>
                  <th>{t.remainingInstallments}</th>
                  <th>{t.totalRemaining}</th>
                  <th className="text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((p) => {
                  const percent = Math.min(100, Math.round((p.paidInstallmentsCount / p.totalInstallments) * 100));
                  return (
                    <tr key={p.id} className={p.isCompleted ? 'row-completed' : ''}>
                      <td>
                        <div className="purchase-name-cell">
                          <span className="purchase-title-text">{p.title}</span>
                          {p.notes && <small className="purchase-notes-hint">📝 {p.notes}</small>}
                        </div>
                      </td>
                      <td>
                        <span
                          className="card-color-chip-badge"
                          style={{ backgroundColor: p.creditCardColor || '#4F46E5' }}
                        >
                          {p.creditCardName}
                        </span>
                      </td>
                      <td>{formatDate(p.purchaseDate, language)}</td>
                      <td className="font-weight-bold">{formatCurrency(p.totalAmount, language)}</td>
                      <td>
                        {p.totalInstallments}x {formatCurrency(p.installmentAmount, language)}
                      </td>
                      <td>
                        <div className="progress-container">
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: p.isCompleted ? '#10B981' : p.creditCardColor || '#4F46E5',
                              }}
                            />
                          </div>
                          <span className="progress-text">
                            {p.paidInstallmentsCount} / {p.totalInstallments} ({percent}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        {p.isCompleted ? (
                          <span className="badge badge-success">{t.statusCompleted}</span>
                        ) : (
                          <span className="badge badge-warning">
                            {p.remainingInstallmentsCount} {language === 'pt' ? 'restantes' : 'left'}
                          </span>
                        )}
                      </td>
                      <td className="font-weight-bold highlight-remaining">
                        {p.isCompleted ? 'R$ 0,00' : formatCurrency(p.remainingAmount, language)}
                      </td>
                      <td className="text-right actions-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleOpenEdit(p)}
                          title={t.edit}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDelete(p)}
                          title={t.delete}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <CreditCardPurchaseModal
          language={language}
          purchase={editingPurchase}
          cards={cards}
          initialCardId={selectedCardId !== 'all' ? selectedCardId : undefined}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
