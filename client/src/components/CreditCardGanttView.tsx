import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Language, translations, formatCurrency } from '../i18n';
import {
  api,
  type CreditCard,
  type CreditCardTimeline,
  type CreateCreditCardPurchasePayload,
  type UpdateCreditCardPurchasePayload,
} from '../api';
import { CreditCardPurchaseModal } from './CreditCardPurchaseModal';

interface CreditCardGanttViewProps {
  language: Language;
  onNavigateToCards?: () => void;
  onNavigateToPurchases?: () => void;
}

export const CreditCardGanttView: React.FC<CreditCardGanttViewProps> = ({
  language,
  onNavigateToCards,
  onNavigateToPurchases,
}) => {
  const t = translations[language];

  const [timeline, setTimeline] = useState<CreditCardTimeline | null>(null);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsData, timelineData] = await Promise.all([
        api.getCreditCards(),
        api.getCreditCardTimeline(selectedCardId === 'all' ? undefined : selectedCardId),
      ]);
      setCards(cardsData);
      setTimeline(timelineData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading timeline');
    } finally {
      setLoading(false);
    }
  }, [selectedCardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    if (cards.length === 0) {
      if (
        window.confirm(
          language === 'pt'
            ? 'Você precisa cadastrar um cartão de crédito primeiro. Deseja ir para Meus Cartões?'
            : 'You need to register a credit card first. Go to My Cards?'
        )
      ) {
        onNavigateToCards?.();
      }
      return;
    }
    setModalOpen(true);
  };

  const handleSavePurchase = async (
    data: CreateCreditCardPurchasePayload | UpdateCreditCardPurchasePayload
  ) => {
    await api.createCreditCardPurchase(data as CreateCreditCardPurchasePayload);
    await loadData();
  };

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  // Timeline month range calculation
  const timelineMonths = useMemo(() => {
    if (!timeline || timeline.monthlySummaries.length === 0) return [];
    return timeline.monthlySummaries.map((m) => {
      const monthDate = new Date(m.year, m.month - 1, 1);
      const monthName = t.months[m.month - 1].slice(0, 3);
      const isCurrent =
        timeline.referenceMonth.startsWith(`${m.year}-${String(m.month).padStart(2, '0')}`);
      return {
        year: m.year,
        month: m.month,
        key: `${m.year}-${String(m.month).padStart(2, '0')}`,
        label: `${monthName}/${String(m.year).slice(2)}`,
        fullLabel: `${t.months[m.month - 1]} ${m.year}`,
        date: monthDate,
        isCurrent,
        summary: m,
      };
    });
  }, [timeline, t.months]);

  // Current month active items count and final month badge
  const currentMonthSummary = useMemo(() => {
    if (!timeline || !timeline.referenceMonth) return null;
    const [refY, refM] = timeline.referenceMonth.split('-').map(Number);
    return timeline.monthlySummaries.find((m) => m.year === refY && m.month === refM) ?? null;
  }, [timeline]);

  const totalMonthsRemaining = useMemo(() => {
    if (!timeline || !timeline.finalMonth || !timeline.referenceMonth) return 0;
    const [refY, refM] = timeline.referenceMonth.split('-').map(Number);
    const [finY, finM] = timeline.finalMonth.split('-').map(Number);
    return Math.max(0, (finY - refY) * 12 + (finM - refM) + 1);
  }, [timeline]);

  const formattedFinalMonth = useMemo(() => {
    if (!timeline || !timeline.finalMonth) return '-';
    const [finY, finM] = timeline.finalMonth.split('-').map(Number);
    if (!finY || !finM) return '-';
    return `${t.months[finM - 1]} de ${finY}`;
  }, [timeline, t.months]);

  return (
    <div className="gantt-view-container">
      <div className="view-header">
        <div>
          <h2>📈 {t.ganttTitle}</h2>
          <p className="view-subtitle">{t.ganttSubtitle}</p>
        </div>
        <div className="view-header-actions">
          <button type="button" className="btn btn-outline" onClick={onNavigateToPurchases}>
            🛍️ {t.purchasesTitle}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            + {t.addPurchase}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter by Card */}
      <div className="gantt-filter-bar card">
        <div className="filter-item">
          <label htmlFor="gantt-card-filter">{t.filterByCard}</label>
          <select
            id="gantt-card-filter"
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
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>{t.loading}</p>
        </div>
      ) : !timeline || timeline.ganttItems.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📈</div>
          <h3>{t.noActiveInstallments}</h3>
          <p>{t.noPurchasesPrompt}</p>
          <button type="button" className="btn btn-primary mt-3" onClick={handleOpenAdd}>
            + {t.addPurchase}
          </button>
        </div>
      ) : (
        <>
          {/* Top KPI Metric Cards */}
          <div className="gantt-metrics-grid">
            <div className="metric-card active-items-card">
              <div className="metric-icon">🛍️</div>
              <div className="metric-info">
                <span className="metric-label">{t.activeItemsCurrentMonth}</span>
                <span className="metric-value">
                  {currentMonthSummary ? currentMonthSummary.activePurchasesCount : 0}
                </span>
                <span className="metric-hint">
                  {language === 'pt' ? 'com parcela na fatura deste mês' : 'with installment this month'}
                </span>
              </div>
            </div>

            <div className="metric-card to-pay-card">
              <div className="metric-icon">💳</div>
              <div className="metric-info">
                <span className="metric-label">{t.toPayCurrentMonth}</span>
                <span className="metric-value highlight-green">
                  {formatCurrency(timeline.currentMonthTotal, language)}
                </span>
                <span className="metric-hint">
                  {language === 'pt' ? 'fatura do mês atual' : 'current month invoice'}
                </span>
              </div>
            </div>

            <div className="metric-card duration-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-info">
                <span className="metric-label">{t.monthsUntilFinish}</span>
                <span className="metric-value">{totalMonthsRemaining} {language === 'pt' ? 'meses' : 'months'}</span>
                <span className="metric-hint">
                  {language === 'pt' ? `até ${formattedFinalMonth}` : `until ${formattedFinalMonth}`}
                </span>
              </div>
            </div>

            <div className="metric-card committed-card">
              <div className="metric-icon">📊</div>
              <div className="metric-info">
                <span className="metric-label">{t.totalFutureCommitment}</span>
                <span className="metric-value highlight-blue">
                  {formatCurrency(timeline.totalRemainingAmount, language)}
                </span>
                <span className="metric-hint">
                  {language === 'pt' ? 'todas as parcelas restantes' : 'all remaining installments'}
                </span>
              </div>
            </div>
          </div>

          {/* Gantt Horizontal Bar Chart */}
          <div className="gantt-chart-container card">
            <div className="gantt-chart-header">
              <h3>📊 {language === 'pt' ? 'Gráfico Gantt - Duração dos Parcelamentos' : 'Gantt Chart - Installment Durations'}</h3>
              <span className="gantt-hint">
                {language === 'pt'
                  ? 'Barras horizontais mostram a linha do tempo e a duração de cada parcelamento'
                  : 'Horizontal bars illustrate timeline and duration of each installment purchase'}
              </span>
            </div>

            <div className="gantt-scroll-wrapper">
              <div className="gantt-table">
                {/* Header: Item Details Column + Months Columns */}
                <div
                  className="gantt-row gantt-header-row"
                  style={{ gridTemplateColumns: `280px repeat(${timelineMonths.length}, 90px)` }}
                >
                  <div className="gantt-cell gantt-item-title-col">
                    <span>{t.purchaseTitle}</span>
                  </div>
                  {timelineMonths.map((m) => (
                    <div
                      key={m.key}
                      className={`gantt-month-header ${m.isCurrent ? 'is-current-month' : ''}`}
                    >
                      <span className="month-name">{m.label}</span>
                      {m.isCurrent && (
                        <span className="current-badge-dot" title={t.currentMonthBadge}>
                          ●
                        </span>
                      )}
                      <span className="month-subtotal">
                        {formatCurrency(m.summary.totalAmount, language)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rows: Each Purchase */}
                {timeline.ganttItems.map((item) => {
                  const cardColor = item.creditCardColor || '#4F46E5';
                  const [startYear, startMonth] = item.firstInstallmentMonth.split('-').map(Number);
                  const [refY, refM] = timeline.referenceMonth.split('-').map(Number);

                  return (
                    <div
                      key={item.id}
                      className="gantt-row gantt-item-row"
                      style={{ gridTemplateColumns: `280px repeat(${timelineMonths.length}, 90px)` }}
                    >
                      {/* Left: Item Information (Sticky) */}
                      <div className="gantt-cell gantt-item-title-col">
                        <div className="gantt-item-meta">
                          <span className="gantt-title-text" title={item.title}>
                            {item.title}
                          </span>
                          <div className="gantt-card-badge-row">
                            <span
                              className="gantt-card-pill"
                              style={{ backgroundColor: cardColor }}
                            >
                              {item.creditCardName}
                            </span>
                            <span className="gantt-amount-tag">
                              {item.totalInstallments}x de {formatCurrency(item.installmentAmount, language)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Gantt Month Cells */}
                      {timelineMonths.map((m) => {
                        const mIndex =
                          (m.year - startYear) * 12 + (m.month - startMonth);
                        const isInRange =
                          mIndex >= 0 && mIndex < item.totalInstallments;
                        const installmentNum = isInRange ? mIndex + 1 : null;
                        const isPast =
                          m.year < refY || (m.year === refY && m.month < refM);
                        const isCurrent = m.isCurrent;

                        return (
                          <div
                            key={m.key}
                            className={`gantt-month-cell ${isCurrent ? 'is-current-column' : ''}`}
                          >
                            {isInRange && (
                              <div
                                className={`gantt-bar-segment ${
                                  isCurrent ? 'is-current-segment' : isPast ? 'is-past-segment' : 'is-future-segment'
                                }`}
                                style={{
                                  backgroundColor: cardColor,
                                  opacity: isPast ? 0.5 : 1,
                                }}
                                title={`${item.title} (${item.creditCardName}) - ${
                                  language === 'pt' ? 'Parcela' : 'Installment'
                                } ${installmentNum}/${item.totalInstallments}: ${formatCurrency(
                                  item.installmentAmount,
                                  language
                                )}`}
                              >
                                <span className="bar-segment-label">
                                  {installmentNum}/{item.totalInstallments}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Month-by-Month Forecast Table / Accordion */}
          <div className="projection-section card">
            <div className="projection-header">
              <h3>📅 {t.projectionTableTitle}</h3>
              <span className="projection-subtitle">
                {language === 'pt'
                  ? 'Previsão exata do valor a pagar e quais parcelas vencem mês a mês'
                  : 'Exact forecast of amount to pay and active installments month by month'}
              </span>
            </div>

            <div className="projection-months-list">
              {timeline.monthlySummaries.map((m) => {
                const monthKey = `${m.year}-${String(m.month).padStart(2, '0')}`;
                const isExpanded = expandedMonths.has(monthKey);
                const isCurrent =
                  timeline.referenceMonth.startsWith(monthKey);
                const monthTitle = `${t.months[m.month - 1]} de ${m.year}`;

                return (
                  <div
                    key={monthKey}
                    className={`projection-month-card ${isCurrent ? 'is-current-month-card' : ''}`}
                  >
                    <div
                      className="projection-month-row"
                      onClick={() => toggleMonthExpansion(monthKey)}
                    >
                      <div className="month-row-left">
                        <span className="toggle-chevron">{isExpanded ? '▼' : '▶'}</span>
                        <span className="projection-month-title">{monthTitle}</span>
                        {isCurrent && (
                          <span className="badge badge-success current-pill-badge">
                            {t.currentMonthBadge}
                          </span>
                        )}
                        <span className="projection-count-pill">
                          {t.itemsActiveInMonth.replace('{count}', m.activePurchasesCount.toString())}
                        </span>
                      </div>

                      <div className="month-row-right">
                        <span className="projection-total-val">
                          {formatCurrency(m.totalAmount, language)}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="projection-items-breakdown">
                        <table className="table mini-breakdown-table">
                          <thead>
                            <tr>
                              <th>{t.purchaseTitle}</th>
                              <th>{language === 'pt' ? 'Cartão' : 'Card'}</th>
                              <th>{language === 'pt' ? 'Parcela' : 'Installment'}</th>
                              <th className="text-right">{language === 'pt' ? 'Valor' : 'Amount'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {m.items.map((it) => (
                              <tr key={it.purchaseId}>
                                <td>{it.purchaseTitle}</td>
                                <td>
                                  <span
                                    className="card-color-chip-badge"
                                    style={{ backgroundColor: it.creditCardColor || '#4F46E5' }}
                                  >
                                    {it.creditCardName}
                                  </span>
                                </td>
                                <td>
                                  <span className="installment-num-badge">
                                    {it.installmentNumber} / {it.totalInstallments}
                                  </span>
                                </td>
                                <td className="text-right font-weight-bold">
                                  {formatCurrency(it.installmentAmount, language)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {modalOpen && (
        <CreditCardPurchaseModal
          language={language}
          cards={cards}
          initialCardId={selectedCardId !== 'all' ? selectedCardId : undefined}
          onSave={handleSavePurchase}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
