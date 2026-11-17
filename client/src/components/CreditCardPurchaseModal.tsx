import React, { useState } from 'react';
import { type Language, translations, formatCurrency } from '../i18n';
import {
  type CreditCard,
  type CreditCardPurchase,
  type CreateCreditCardPurchasePayload,
  type UpdateCreditCardPurchasePayload,
} from '../api';

interface CreditCardPurchaseModalProps {
  language: Language;
  purchase?: CreditCardPurchase | null;
  cards: CreditCard[];
  initialCardId?: string;
  onSave: (data: CreateCreditCardPurchasePayload | UpdateCreditCardPurchasePayload) => Promise<void>;
  onClose: () => void;
}

export const CreditCardPurchaseModal: React.FC<CreditCardPurchaseModalProps> = ({
  language,
  purchase,
  cards,
  initialCardId,
  onSave,
  onClose,
}) => {
  const t = translations[language];

  const defaultCardId = purchase?.creditCardId ?? initialCardId ?? (cards.length > 0 ? cards[0].id : '');
  const [todayStr] = useState(() => new Date().toISOString().slice(0, 10));

  const [creditCardId, setCreditCardId] = useState(defaultCardId);
  const [title, setTitle] = useState(purchase?.title ?? '');
  const [purchaseDate, setPurchaseDate] = useState(purchase?.purchaseDate ?? todayStr);
  const [totalAmount, setTotalAmount] = useState<string>(purchase ? purchase.totalAmount.toString() : '');
  const [totalInstallments, setTotalInstallments] = useState<number>(purchase?.totalInstallments ?? 10);
  const [installmentAmount, setInstallmentAmount] = useState<string>(
    purchase ? purchase.installmentAmount.toString() : ''
  );
  const [firstInstallmentMonth, setFirstInstallmentMonth] = useState<string>(() => {
    if (purchase) return purchase.firstInstallmentMonth.slice(0, 7);
    const card = cards.find((c) => c.id === defaultCardId);
    if (!card) return '';
    const [y, m, d] = todayStr.split('-').map(Number);
    let targetYear = y;
    let targetMonth = m;
    if (d > card.closingDay) {
      targetMonth += 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
    }
    return `${targetYear}-${String(targetMonth).padStart(2, '0')}`;
  });
  const [notes, setNotes] = useState(purchase?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSuggestedMonth = (cardId: string, pDate: string) => {
    if (purchase) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const [y, m, d] = pDate.split('-').map(Number);
    if (!y || !m || !d) return;

    let targetYear = y;
    let targetMonth = m;
    if (d > card.closingDay) {
      targetMonth += 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
    }
    setFirstInstallmentMonth(`${targetYear}-${String(targetMonth).padStart(2, '0')}`);
  };

  const handleCardChange = (newCardId: string) => {
    setCreditCardId(newCardId);
    calculateSuggestedMonth(newCardId, purchaseDate);
  };

  const handlePurchaseDateChange = (newDate: string) => {
    setPurchaseDate(newDate);
    calculateSuggestedMonth(creditCardId, newDate);
  };

  // Auto-calculate installment amount when totalAmount or totalInstallments change
  const handleTotalAmountChange = (val: string) => {
    setTotalAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && totalInstallments > 0) {
      const calc = (num / totalInstallments).toFixed(2);
      setInstallmentAmount(calc);
    }
  };

  const handleInstallmentsChange = (val: number) => {
    setTotalInstallments(val);
    const num = parseFloat(totalAmount);
    if (!isNaN(num) && num > 0 && val > 0) {
      const calc = (num / val).toFixed(2);
      setInstallmentAmount(calc);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!creditCardId) {
      setError(language === 'pt' ? 'Selecione um cartão de crédito.' : 'Please select a credit card.');
      return;
    }

    if (!title.trim()) {
      setError(language === 'pt' ? 'A descrição da compra é obrigatória.' : 'Purchase description is required.');
      return;
    }

    const parsedTotal = parseFloat(totalAmount);
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      setError(language === 'pt' ? 'O valor total deve ser maior que zero.' : 'Total amount must be greater than zero.');
      return;
    }

    if (totalInstallments < 1) {
      setError(language === 'pt' ? 'A quantidade de parcelas deve ser pelo menos 1.' : 'Number of installments must be at least 1.');
      return;
    }

    if (!firstInstallmentMonth) {
      setError(language === 'pt' ? 'Informe o mês da primeira parcela.' : 'First installment month is required.');
      return;
    }

    const parsedInstallment = parseFloat(installmentAmount);
    const instAmount = !isNaN(parsedInstallment) && parsedInstallment > 0 ? parsedInstallment : undefined;

    setLoading(true);
    try {
      const formattedMonth = `${firstInstallmentMonth}-01`;
      await onSave({
        creditCardId,
        title: title.trim(),
        purchaseDate,
        totalAmount: parsedTotal,
        totalInstallments,
        firstInstallmentMonth: formattedMonth,
        installmentAmount: instAmount,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving purchase');
    } finally {
      setLoading(false);
    }
  };

  const selectedCard = cards.find((c) => c.id === creditCardId);

  return (
    <div className="modal-backdrop">
      <div className="modal-content purchase-modal">
        <div className="modal-header">
          <h3>{purchase ? t.editPurchase : t.addPurchase}</h3>
          <button type="button" className="close-btn" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="purchase-card">{t.selectCard} *</label>
            <select
              id="purchase-card"
              className="form-control"
              value={creditCardId}
              onChange={(e) => handleCardChange(e.target.value)}
              required
              disabled={loading}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({language === 'pt' ? `Fecha dia ${c.closingDay}` : `Closes day ${c.closingDay}`})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="purchase-title">{t.purchaseTitle} *</label>
            <input
              id="purchase-title"
              type="text"
              className="form-control"
              placeholder={language === 'pt' ? 'Ex: Geladeira Samsung, Notebook, Passagens...' : 'e.g. Fridge, Laptop, Flight tickets...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="purchase-date">{t.purchaseDate} *</label>
              <input
                id="purchase-date"
                type="date"
                className="form-control"
                value={purchaseDate}
                onChange={(e) => handlePurchaseDateChange(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group col">
              <label htmlFor="purchase-first-month">{t.firstInstallmentMonth} *</label>
              <input
                id="purchase-first-month"
                type="month"
                className="form-control"
                value={firstInstallmentMonth}
                onChange={(e) => setFirstInstallmentMonth(e.target.value)}
                required
                disabled={loading}
              />
              <small className="form-hint">
                {language === 'pt' ? 'Fatura em que cairá a 1ª cobrança' : 'Invoice month of first installment'}
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="purchase-total">{t.totalAmount} *</label>
              <input
                id="purchase-total"
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group col">
              <label htmlFor="purchase-installments">{t.totalInstallments} *</label>
              <input
                id="purchase-installments"
                type="number"
                min="1"
                max="72"
                className="form-control"
                value={totalInstallments}
                onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group col">
              <label htmlFor="purchase-installment-amount">{t.installmentAmount}</label>
              <input
                id="purchase-installment-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="0.00"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                disabled={loading}
              />
              <small className="form-hint">
                {language === 'pt' ? 'Calculado automaticamente' : 'Auto-calculated'}
              </small>
            </div>
          </div>

          {/* Quick summary preview */}
          {totalAmount && totalInstallments > 0 && (
            <div className="purchase-calc-summary">
              <span className="summary-card-tag" style={{ backgroundColor: selectedCard?.color || '#4F46E5' }}>
                {selectedCard?.name}
              </span>
              <span>
                {totalInstallments}x {language === 'pt' ? 'de' : 'of'}{' '}
                <strong>
                  {formatCurrency(parseFloat(installmentAmount) || (parseFloat(totalAmount) / totalInstallments), language)}
                </strong>
              </span>
              <span className="text-muted">
                ({language === 'pt' ? 'Total:' : 'Total:'} {formatCurrency(parseFloat(totalAmount), language)})
              </span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="purchase-notes">{t.notes}</label>
            <textarea
              id="purchase-notes"
              className="form-control"
              rows={2}
              placeholder={language === 'pt' ? 'Observações adicionais (opcional)...' : 'Additional notes (optional)...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t.loading : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
