import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Language, translations, formatCurrency, formatDate } from '../i18n';
import { api, type BillOccurrence, BillFrequency, type OccurrencesFilterParams } from '../api';
import { BillModal } from './BillModal';
import { PaymentModal } from './PaymentModal';

interface BillsListProps {
  language: Language;
}

export const BillsList: React.FC<BillsListProps> = ({ language }) => {
  const t = translations[language];

  const [dateInfo] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      today: now.toISOString().split('T')[0],
    };
  });

  // Filters
  const [filterType, setFilterType] = useState<'none' | 'month' | 'next_days'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(dateInfo.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(dateInfo.month);
  const [selectedDays, setSelectedDays] = useState<number>(30);

  // Data
  const [occurrences, setOccurrences] = useState<BillOccurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedOccurrenceForPayment, setSelectedOccurrenceForPayment] = useState<BillOccurrence | null>(null);

  const fetchOccurrences = useCallback(async () => {
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });

    const params: OccurrencesFilterParams = {
      filterType,
      refDate: dateInfo.today,
    };

    if (filterType === 'month') {
      params.year = selectedYear;
      params.month = selectedMonth;
    } else if (filterType === 'next_days') {
      params.days = selectedDays;
    }

    try {
      const data = await api.getOccurrences(params);
      setOccurrences(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(language === 'pt' ? 'Erro ao carregar contas.' : 'Error loading bills.');
      }
    } finally {
      setLoading(false);
    }
  }, [filterType, selectedYear, selectedMonth, selectedDays, dateInfo.today, language]);

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

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchOccurrences();
  }, [fetchOccurrences]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl+Shift++ (or Cmd+Shift++)
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isPlus = e.key === '+' || e.code === 'NumpadAdd' || (e.code === 'Equal' && isShift);

      if (isCtrl && isShift && isPlus) {
        e.preventDefault();
        setIsBillModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUndoPayment = async (occurrence: BillOccurrence) => {
    if (!occurrence.executionId) return;
    if (!window.confirm(t.confirmUndoPayment)) return;

    try {
      await api.deleteExecution(occurrence.executionId);
      fetchOccurrences();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error undoing payment');
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm(t.confirmDeleteBill)) return;

    try {
      await api.deleteBill(billId);
      fetchOccurrences();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting bill');
    }
  };

  // KPIs
  const summary = useMemo(() => {
    let expected = 0;
    let paid = 0;
    let pending = 0;

    for (const occ of occurrences) {
      expected += occ.expectedAmount;
      if (occ.isPaid) {
        paid += occ.paidAmount ?? occ.expectedAmount;
      } else {
        pending += occ.expectedAmount;
      }
    }

    return {
      totalExpected: expected,
      totalPaid: paid,
      totalPending: pending,
      count: occurrences.length,
    };
  }, [occurrences]);

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

  return (
    <div className="bills-container">
      {/* Top Header & New Bill button */}
      <div className="bills-header">
        <div className="bills-title-wrapper">
          <h2>{t.billsTitle}</h2>
          <p className="bills-subtitle">
            {filterType === 'none' && t.filterNone}
            {filterType === 'month' && `${t.filterMonth}: ${t.months[selectedMonth - 1]} / ${selectedYear}`}
            {filterType === 'next_days' && `${t.filterNextDays}: ${selectedDays} ${t.daysCount.toLowerCase()}`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-new-bill"
          onClick={() => setIsBillModalOpen(true)}
          title={`${t.newBillBtn} (${t.newBillShortcutHint})`}
        >
          <span>{t.newBillBtn}</span>
          <kbd className="shortcut-kbd">Ctrl+Shift++</kbd>
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-card">
        <div className="filter-modes">
          <span className="filter-title">{t.filterLabel}</span>
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'month' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('month')}
            >
              📅 {t.filterMonth}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'next_days' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('next_days')}
            >
              ⏳ {t.filterNextDays}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filterType === 'none' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterType('none')}
            >
              📋 {t.filterNone}
            </button>
          </div>
        </div>

        {/* Filter Details */}
        {filterType === 'month' && (
          <div className="filter-options-row">
            <div className="filter-field">
              <label htmlFor="filter-month-select">{t.monthSelect}:</label>
              <select
                id="filter-month-select"
                className="form-control form-control-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {t.months.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <label htmlFor="filter-year-input">Ano:</label>
              <input
                id="filter-year-input"
                type="number"
                className="form-control form-control-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                min={2020}
                max={2050}
              />
            </div>
          </div>
        )}

        {filterType === 'next_days' && (
          <div className="filter-options-row">
            <span className="filter-quick-label">{t.daysCount}:</span>
            <div className="quick-days-buttons">
              {[7, 15, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={`btn btn-xs ${selectedDays === d ? 'btn-accent' : 'btn-outline'}`}
                  onClick={() => setSelectedDays(d)}
                >
                  {d} {language === 'pt' ? 'dias' : 'days'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">{t.summaryTotalExpected}</span>
          <span className="kpi-value">{formatCurrency(summary.totalExpected, language)}</span>
        </div>
        <div className="kpi-card kpi-success">
          <span className="kpi-label">{t.summaryTotalPaid}</span>
          <span className="kpi-value">{formatCurrency(summary.totalPaid, language)}</span>
        </div>
        <div className="kpi-card kpi-warning">
          <span className="kpi-label">{t.summaryTotalPending}</span>
          <span className="kpi-value">{formatCurrency(summary.totalPending, language)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">{t.summaryOccurrencesCount}</span>
          <span className="kpi-value">{summary.count}</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Occurrences Checklist */}
      <div className="checklist-container">
        {loading ? (
          <div className="empty-state">
            <p>{t.loading}</p>
          </div>
        ) : occurrences.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">{t.noBillsFound}</p>
            <p className="empty-hint">{t.noBillsPrompt}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsBillModalOpen(true)}
            >
              {t.newBillBtn}
            </button>
          </div>
        ) : (
          <div className="occurrence-list">
            {occurrences.map((occ, idx) => {
              const isOverdue = !occ.isPaid && occ.dueDate < dateInfo.today;
              return (
                <div
                  key={`${occ.billId}-${occ.dueDate}-${idx}`}
                  className={`occurrence-item ${occ.isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'}`}
                >
                  <div className="occurrence-left">
                    <button
                      type="button"
                      className={`check-button ${occ.isPaid ? 'checked' : ''}`}
                      onClick={() => {
                        if (occ.isPaid) {
                          handleUndoPayment(occ);
                        } else {
                          setSelectedOccurrenceForPayment(occ);
                        }
                      }}
                      title={occ.isPaid ? t.undoPayAction : t.payAction}
                    >
                      {occ.isPaid ? '✓' : ''}
                    </button>

                    <div className="occurrence-info">
                      <div className="occurrence-title-row">
                        <span className={`occurrence-title ${occ.isPaid ? 'line-through' : ''}`}>
                          {occ.billTitle}
                        </span>
                        <span className="badge badge-frequency">
                          {getFrequencyLabel(occ.frequency)}
                        </span>
                        {isOverdue && (
                          <span className="badge badge-danger">
                            {language === 'pt' ? 'Vencida' : 'Overdue'}
                          </span>
                        )}
                        {occ.isPaid && (
                          <span className="badge badge-success">
                            {t.statusPaid}
                          </span>
                        )}
                      </div>

                      <div className="occurrence-meta">
                        <span className="occurrence-date">
                          📅 {t.dueAt}: <strong>{formatDate(occ.dueDate, language)}</strong>
                        </span>
                        {occ.isPaid && occ.paymentDate && (
                          <span className="occurrence-paid-meta">
                            💵 {t.paymentDate}: {formatDate(occ.paymentDate, language)}
                            {occ.paidAmount != null && ` (${formatCurrency(occ.paidAmount, language)})`}
                          </span>
                        )}
                        {occ.notes && (
                          <span className="occurrence-notes" title={occ.notes}>
                            📝 {occ.notes}
                          </span>
                        )}
                        {occ.paymentLink && getSafeUrl(occ.paymentLink) && (
                          <a
                            href={getSafeUrl(occ.paymentLink)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="occurrence-boleto-link"
                            title={occ.paymentLink}
                          >
                            📄 {t.openBoletoAction}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="occurrence-right">
                    <div className="occurrence-amount-box">
                      <span className="amount-label">{t.expectedAmount}:</span>
                      <span className="amount-val">
                        {formatCurrency(occ.expectedAmount, language)}
                      </span>
                    </div>

                    <div className="occurrence-actions">
                      {occ.paymentLink && getSafeUrl(occ.paymentLink) && (
                        <a
                          href={getSafeUrl(occ.paymentLink)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-xs btn-outline btn-boleto"
                          title={`${t.openBoletoAction}: ${occ.paymentLink}`}
                        >
                          📄 {t.openBoletoAction}
                        </a>
                      )}

                      {!occ.isPaid ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => setSelectedOccurrenceForPayment(occ)}
                        >
                          {t.payAction}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-xs btn-outline"
                          onClick={() => handleUndoPayment(occ)}
                        >
                          {t.undoPayAction}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-xs btn-danger-outline"
                        onClick={() => handleDeleteBill(occ.billId)}
                        title={t.deleteBillAction}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bill creation modal */}
      {isBillModalOpen && (
        <BillModal
          language={language}
          onClose={() => setIsBillModalOpen(false)}
          onCreated={fetchOccurrences}
        />
      )}

      {/* Payment registration modal */}
      {selectedOccurrenceForPayment && (
        <PaymentModal
          occurrence={selectedOccurrenceForPayment}
          language={language}
          onClose={() => setSelectedOccurrenceForPayment(null)}
          onPaymentSuccess={fetchOccurrences}
        />
      )}
    </div>
  );
};
