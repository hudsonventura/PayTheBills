import React, { useState } from 'react';
import { type Language, translations, formatCurrency, formatDate } from '../i18n';
import { api, type BillOccurrence, type RegisterExecutionPayload } from '../api';

const getTodayStr = (): string => new Date().toISOString().split('T')[0];

interface PaymentModalProps {
  occurrence: BillOccurrence;
  language: Language;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  occurrence,
  language,
  onClose,
  onPaymentSuccess,
}) => {
  const t = translations[language];

  const [paymentDate, setPaymentDate] = useState(getTodayStr);
  const [paidAmount, setPaidAmount] = useState(() => occurrence.expectedAmount.toFixed(2));
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(paidAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError(language === 'pt' ? 'Valor pago inválido.' : 'Invalid paid amount.');
      return;
    }

    if (!paymentDate) {
      setError(language === 'pt' ? 'Informe a data do pagamento.' : 'Please enter payment date.');
      return;
    }

    setLoading(true);

    try {
      const payload: RegisterExecutionPayload = {
        paymentDate,
        paidAmount: amountNum,
        referenceDueDate: occurrence.dueDate,
        notes: notes.trim() || null,
      };

      await api.registerExecution(occurrence.billId, payload);
      onPaymentSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === 'pt' ? 'Erro ao registrar pagamento.' : 'Error registering payment.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{t.paymentModalTitle}</h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="payment-target-card">
          <h4>{occurrence.billTitle}</h4>
          <div className="payment-target-meta">
            <span>
              <strong>{t.dueAt}:</strong> {formatDate(occurrence.dueDate, language)}
            </span>
            <span>
              <strong>{t.expectedAmount}:</strong> {formatCurrency(occurrence.expectedAmount, language)}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="payment-date">{t.paymentDate}</label>
            <input
              id="payment-date"
              type="date"
              className="form-control"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="paid-amount">{t.paidAmount}</label>
            <input
              id="paid-amount"
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="payment-notes">{t.paymentNotes}</label>
            <textarea
              id="payment-notes"
              className="form-control"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.paymentNotesPlaceholder}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? t.loading : t.confirmPayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
