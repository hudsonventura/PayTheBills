import React, { useState } from 'react';
import { type Language, translations } from '../i18n';
import { api, BillFrequency, type CreateBillPayload } from '../api';

const getTodayStr = (): string => new Date().toISOString().split('T')[0];

interface BillModalProps {
  language: Language;
  onClose: () => void;
  onCreated: () => void;
}

export const BillModal: React.FC<BillModalProps> = ({
  language,
  onClose,
  onCreated,
}) => {
  const t = translations[language];

  const [title, setTitle] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>(BillFrequency.Monthly);
  const [startDate, setStartDate] = useState(getTodayStr);
  const [dueDate, setDueDate] = useState(getTodayStr);
  const [dayOfMonth, setDayOfMonth] = useState<number>(10);
  const [intervalMonths, setIntervalMonths] = useState<number>(3);
  const [monthOfYear, setMonthOfYear] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(expectedAmount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError(language === 'pt' ? 'Valor esperado inválido.' : 'Invalid expected amount.');
      return;
    }

    if (!title.trim()) {
      setError(language === 'pt' ? 'Informe o título da conta.' : 'Please enter a bill title.');
      return;
    }

    const payload: CreateBillPayload = {
      title: title.trim(),
      expectedAmount: amountNum,
      frequency,
      startDate,
      notes: notes.trim() || null,
      paymentLink: paymentLink.trim() || null,
    };

    if (frequency === BillFrequency.Once) {
      if (!dueDate) {
        setError(language === 'pt' ? 'Informe a data de vencimento.' : 'Please enter the due date.');
        return;
      }
      payload.dueDate = dueDate;
    } else if (frequency === BillFrequency.Monthly) {
      if (dayOfMonth < 1 || dayOfMonth > 31) {
        setError(language === 'pt' ? 'Dia do mês deve ser entre 1 e 31.' : 'Day of month must be between 1 and 31.');
        return;
      }
      payload.dayOfMonth = dayOfMonth;
    } else if (frequency === BillFrequency.EveryNMonths) {
      if (dayOfMonth < 1 || dayOfMonth > 31) {
        setError(language === 'pt' ? 'Dia do mês deve ser entre 1 e 31.' : 'Day of month must be between 1 and 31.');
        return;
      }
      if (intervalMonths < 1) {
        setError(language === 'pt' ? 'Intervalo de meses deve ser pelo menos 1.' : 'Month interval must be at least 1.');
        return;
      }
      payload.dayOfMonth = dayOfMonth;
      payload.intervalMonths = intervalMonths;
    } else if (frequency === BillFrequency.Yearly) {
      if (dayOfMonth < 1 || dayOfMonth > 31) {
        setError(language === 'pt' ? 'Dia do mês deve ser entre 1 e 31.' : 'Day of month must be between 1 and 31.');
        return;
      }
      if (monthOfYear < 1 || monthOfYear > 12) {
        setError(language === 'pt' ? 'Mês deve ser entre 1 e 12.' : 'Month must be between 1 and 12.');
        return;
      }
      payload.dayOfMonth = dayOfMonth;
      payload.monthOfYear = monthOfYear;
    }

    setLoading(true);

    try {
      await api.createBill(payload);
      onCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === 'pt' ? 'Erro ao criar conta.' : 'Error creating bill.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{t.createBillTitle}</h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="bill-title">{t.billTitle}</label>
            <input
              id="bill-title"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.billTitlePlaceholder}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="bill-amount">{t.expectedAmount}</label>
              <input
                id="bill-amount"
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                placeholder="150.00"
                required
              />
            </div>

            <div className="form-group col">
              <label htmlFor="bill-frequency">{t.frequency}</label>
              <select
                id="bill-frequency"
                className="form-control"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value) as BillFrequency)}
              >
                <option value={BillFrequency.Once}>{t.freqOnce}</option>
                <option value={BillFrequency.Monthly}>{t.freqMonthly}</option>
                <option value={BillFrequency.EveryNMonths}>{t.freqEveryNMonths}</option>
                <option value={BillFrequency.Yearly}>{t.freqYearly}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bill-start-date">{t.startDate}</label>
            <input
              id="bill-start-date"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* Conditional inputs depending on frequency */}
          {frequency === BillFrequency.Once && (
            <div className="form-group">
              <label htmlFor="bill-due-date">{t.dueDate}</label>
              <input
                id="bill-due-date"
                type="date"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          )}

          {frequency === BillFrequency.Monthly && (
            <div className="form-group">
              <label htmlFor="bill-day-month">{t.dayOfMonth}</label>
              <input
                id="bill-day-month"
                type="number"
                min="1"
                max="31"
                className="form-control"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                required
              />
            </div>
          )}

          {frequency === BillFrequency.EveryNMonths && (
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="bill-interval">{t.intervalMonths}</label>
                <input
                  id="bill-interval"
                  type="number"
                  min="1"
                  className="form-control"
                  value={intervalMonths}
                  onChange={(e) => setIntervalMonths(parseInt(e.target.value, 10))}
                  placeholder="3"
                  required
                />
              </div>
              <div className="form-group col">
                <label htmlFor="bill-day-interval">{t.dayOfMonth}</label>
                <input
                  id="bill-day-interval"
                  type="number"
                  min="1"
                  max="31"
                  className="form-control"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>
          )}

          {frequency === BillFrequency.Yearly && (
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="bill-month-year">{t.monthOfYear}</label>
                <select
                  id="bill-month-year"
                  className="form-control"
                  value={monthOfYear}
                  onChange={(e) => setMonthOfYear(parseInt(e.target.value, 10))}
                >
                  {t.months.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col">
                <label htmlFor="bill-day-yearly">{t.dayOfMonth}</label>
                <input
                  id="bill-day-yearly"
                  type="number"
                  min="1"
                  max="31"
                  className="form-control"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="bill-payment-link">{t.paymentLink}</label>
            <input
              id="bill-payment-link"
              type="url"
              className="form-control"
              value={paymentLink}
              onChange={(e) => setPaymentLink(e.target.value)}
              placeholder={t.paymentLinkPlaceholder}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bill-notes">{t.notes}</label>
            <textarea
              id="bill-notes"
              className="form-control"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t.loading : t.saveBill}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
