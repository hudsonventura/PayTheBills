import React, { useState, useEffect, useCallback } from 'react';
import { type Language, translations, formatCurrency, formatDate } from '../i18n';
import { api, type Bill, BillFrequency } from '../api';
import { BillModal } from './BillModal';

interface BillsManagementProps {
  language: Language;
}

export const BillsManagement: React.FC<BillsManagementProps> = ({ language }) => {
  const t = translations[language];

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBills();
      setBills(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === 'pt' ? 'Erro ao carregar cadastro de contas.' : 'Error loading registered bills.');
      }
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isPlus = e.key === '+' || e.code === 'NumpadAdd' || (e.code === 'Equal' && isShift);

      if (isCtrl && isShift && isPlus) {
        e.preventDefault();
        setEditingBill(null);
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async (billId: string) => {
    if (!window.confirm(t.confirmDeleteBill)) return;

    try {
      await api.deleteBill(billId);
      fetchBills();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting bill');
    }
  };

  const getFrequencyLabel = (freq: BillFrequency): string => {
    switch (freq) {
      case BillFrequency.Once:
        return t.freqOnce;
      case BillFrequency.Monthly:
        return t.freqMonthly;
      case BillFrequency.EveryNMonths:
        return t.freqEveryNMonths;
      case BillFrequency.Yearly:
        return t.freqYearly;
    }
  };

  const getRuleDescription = (bill: Bill): string => {
    switch (bill.frequency) {
      case BillFrequency.Once:
        return t.ruleOnce.replace('{date}', formatDate(bill.dueDate ?? bill.startDate, language));
      case BillFrequency.Monthly:
        return t.ruleMonthly.replace('{day}', String(bill.dayOfMonth ?? 1));
      case BillFrequency.EveryNMonths:
        return t.ruleEveryNMonths
          .replace('{interval}', String(bill.intervalMonths ?? 1))
          .replace('{day}', String(bill.dayOfMonth ?? 1));
      case BillFrequency.Yearly: {
        const monthName = t.months[(bill.monthOfYear ?? 1) - 1];
        return t.ruleYearly
          .replace('{month}', monthName)
          .replace('{day}', String(bill.dayOfMonth ?? 1));
      }
    }
  };

  const getSafeUrl = (url?: string | null): string | null => {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return null;
  };

  return (
    <div className="bills-container">
      {/* Header */}
      <div className="bills-header">
        <div className="bills-title-wrapper">
          <h2>{t.billsManagementTitle}</h2>
          <p className="bills-subtitle">{t.billsManagementSubtitle}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-new-bill"
          onClick={() => {
            setEditingBill(null);
            setIsModalOpen(true);
          }}
          title={`${t.newBillBtn} (${t.newBillShortcutHint})`}
        >
          <span>{t.newBillBtn}</span>
          <kbd className="shortcut-kbd">Ctrl+Shift++</kbd>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="empty-state">
          <p>{t.loading}</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">{t.noBillsRegistered}</p>
          <p className="empty-hint">{t.noBillsRegisteredPrompt}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingBill(null);
              setIsModalOpen(true);
            }}
          >
            {t.newBillBtn}
          </button>
        </div>
      ) : (
        <div className="bills-crud-card">
          <div className="table-responsive">
            <table className="bills-crud-table">
              <thead>
                <tr>
                  <th>{t.billsTableTitle}</th>
                  <th>{t.billsTableExpectedAmount}</th>
                  <th>{t.billsTableFrequency}</th>
                  <th>{t.billsTableRule}</th>
                  <th>{t.billsTableStartDate}</th>
                  <th>{t.billsTablePaymentLink}</th>
                  <th className="text-right">{t.billsTableActions}</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => {
                  const safeLink = getSafeUrl(bill.paymentLink);
                  return (
                    <tr key={bill.id} className="bill-crud-row">
                      <td className="bill-title-cell">
                        <span className="bill-cell-title">{bill.title}</span>
                        {bill.notes && (
                          <span className="bill-cell-notes" title={bill.notes}>
                            📝 {bill.notes}
                          </span>
                        )}
                      </td>
                      <td className="bill-amount-cell">
                        <strong>{formatCurrency(bill.expectedAmount, language)}</strong>
                      </td>
                      <td>
                        <span className="badge badge-frequency">
                          {getFrequencyLabel(bill.frequency)}
                        </span>
                      </td>
                      <td className="bill-rule-cell">
                        <span>{getRuleDescription(bill)}</span>
                      </td>
                      <td>
                        <span>{formatDate(bill.startDate, language)}</span>
                      </td>
                      <td>
                        {safeLink ? (
                          <a
                            href={safeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="occurrence-boleto-link"
                            title={bill.paymentLink!}
                          >
                            📄 {t.openBoletoAction}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="bill-actions-cell text-right">
                        <div className="bill-row-actions">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() => handleEdit(bill)}
                            title={t.editBillAction}
                          >
                            ✏️ {t.edit}
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-danger-outline"
                            onClick={() => handleDelete(bill.id)}
                            title={t.deleteBillAction}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill create/edit modal */}
      {isModalOpen && (
        <BillModal
          bill={editingBill}
          language={language}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBill(null);
          }}
          onSaved={fetchBills}
        />
      )}
    </div>
  );
};
