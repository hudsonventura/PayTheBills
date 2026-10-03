import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type Language, translations, formatCurrency } from '../i18n';
import { api, type MonthlySpending, type Bill } from '../api';

interface MonthlyComparisonViewProps {
  language: Language;
}

export const MonthlyComparisonView: React.FC<MonthlyComparisonViewProps> = ({ language }) => {
  const t = translations[language];

  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(new Set());
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [now] = useState(() => new Date());
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [spendingData, billsData] = await Promise.all([
        api.getMonthlySpending(monthsCount),
        api.getBills(),
      ]);

      setData(spendingData);
      setBills(billsData);

      // On initial load, select all bills by default
      if (!hasInitializedSelection) {
        setSelectedBillIds(new Set(billsData.map((b) => b.id)));
        setHasInitializedSelection(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading monthly data');
    } finally {
      setLoading(false);
    }
  }, [monthsCount, hasInitializedSelection]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle single bill selection
  const handleToggleBill = (billId: string) => {
    setSelectedBillIds((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) {
        next.delete(billId);
      } else {
        next.add(billId);
      }
      return next;
    });
  };

  // Toggle select all / deselect all
  const handleToggleSelectAll = () => {
    if (selectedBillIds.size === bills.length) {
      setSelectedBillIds(new Set());
    } else {
      setSelectedBillIds(new Set(bills.map((b) => b.id)));
    }
  };

  // Process data for the chart based on selected bills
  const processedSeries = useMemo(() => {
    return data.map((monthItem) => {
      const filteredBills = monthItem.bills.filter((b) => selectedBillIds.has(b.billId));
      const paid = filteredBills.reduce((acc, b) => acc + b.paidAmount, 0);
      const expected = filteredBills.reduce((acc, b) => acc + b.expectedAmount, 0);
      const isCurrentMonth = monthItem.year === currentYear && monthItem.month === currentMonth;

      const monthName = t.months[monthItem.month - 1] ?? '';
      const shortName = monthName.slice(0, 3);
      const label = `${shortName}/${String(monthItem.year).slice(2)}`;

      return {
        year: monthItem.year,
        month: monthItem.month,
        monthName,
        label,
        paid,
        expected,
        isCurrentMonth,
        bills: filteredBills,
      };
    });
  }, [data, selectedBillIds, currentYear, currentMonth, t.months]);

  // Summary statistics
  const stats = useMemo(() => {
    if (processedSeries.length === 0) {
      return {
        totalPaid: 0,
        averagePaid: 0,
        currentMonthPaid: 0,
        diffFromPrevious: null as number | null,
        diffPercent: null as number | null,
        peakMonth: null as { label: string; amount: number } | null,
      };
    }

    const totalPaid = processedSeries.reduce((acc, s) => acc + s.paid, 0);
    const averagePaid = totalPaid / processedSeries.length;

    // Find current month and previous month
    const currentItem = processedSeries.find((s) => s.isCurrentMonth);
    const currentIndex = processedSeries.findIndex((s) => s.isCurrentMonth);
    const prevItem = currentIndex > 0 ? processedSeries[currentIndex - 1] : null;

    let diffFromPrevious: number | null = null;
    let diffPercent: number | null = null;

    if (currentItem && prevItem) {
      diffFromPrevious = currentItem.paid - prevItem.paid;
      if (prevItem.paid > 0) {
        diffPercent = (diffFromPrevious / prevItem.paid) * 100;
      }
    }

    // Peak month
    let maxItem = processedSeries[0];
    for (const item of processedSeries) {
      if (item.paid > maxItem.paid) {
        maxItem = item;
      }
    }

    return {
      totalPaid,
      averagePaid,
      currentMonthPaid: currentItem?.paid ?? 0,
      diffFromPrevious,
      diffPercent,
      peakMonth: maxItem.paid > 0 ? { label: maxItem.label, amount: maxItem.paid } : null,
    };
  }, [processedSeries]);

  const maxChartValue = useMemo(() => {
    const highest = Math.max(...processedSeries.map((s) => s.paid), 0);
    if (highest === 0) return 100;
    // Add 15% headroom
    return Math.ceil(highest * 1.15);
  }, [processedSeries]);

  const allSelected = bills.length > 0 && selectedBillIds.size === bills.length;

  return (
    <div className="comparison-container">
      {/* Top Header */}
      <div className="comparison-header">
        <div className="comparison-title-wrapper">
          <h2>{t.comparisonTitle}</h2>
          <p className="comparison-subtitle">{t.comparisonSubtitle}</p>
        </div>

        {/* Period Selector (6 or 12 months) */}
        <div className="period-selector">
          <span className="period-label">{t.periodLabel}</span>
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-sm ${monthsCount === 6 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMonthsCount(6)}
            >
              {t.last6Months}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${monthsCount === 12 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMonthsCount(12)}
            >
              {t.last12Months}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{t.errorOccurred} {error}</span>
        </div>
      )}

      {/* Filter by Bill Section */}
      <div className="filter-card bills-filter-card">
        <div className="bills-filter-header">
          <div className="bills-filter-title">
            <strong>{t.filterByBill}</strong>
            <span className="bills-selected-badge">
              {t.billsSelectedCount
                .replace('{selected}', String(selectedBillIds.size))
                .replace('{total}', String(bills.length))}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline select-all-btn"
            onClick={handleToggleSelectAll}
            disabled={bills.length === 0}
          >
            {allSelected ? `☐ ${t.deselectAllBills}` : `☑ ${t.selectAllBills}`}
          </button>
        </div>

        {bills.length === 0 ? (
          <p className="no-bills-text">{t.noBillsToCompare}</p>
        ) : (
          <div className="bills-chips-grid">
            {bills.map((bill) => {
              const isChecked = selectedBillIds.has(bill.id);
              return (
                <label
                  key={bill.id}
                  className={`bill-chip-item ${isChecked ? 'active' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleBill(bill.id)}
                  />
                  <span className="bill-chip-title" title={bill.title}>
                    {bill.title}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <span className="summary-label">{t.totalSpentPeriod}</span>
          <span className="summary-value highlight">
            {formatCurrency(stats.totalPaid, language)}
          </span>
          <span className="summary-subtext">
            {t.billsSelectedCount
              .replace('{selected}', String(selectedBillIds.size))
              .replace('{total}', String(bills.length))}
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">{t.monthlyAverage}</span>
          <span className="summary-value">
            {formatCurrency(stats.averagePaid, language)}
          </span>
          <span className="summary-subtext">
            {monthsCount === 6 ? t.last6Months : t.last12Months}
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-label">
            {t.currentMonth.replace('{month}', t.months[currentMonth - 1] ?? '')}
          </span>
          <span className="summary-value highlight-current">
            {formatCurrency(stats.currentMonthPaid, language)}
          </span>
          {stats.diffFromPrevious !== null && (
            <span
              className={`summary-diff ${
                stats.diffFromPrevious > 0
                  ? 'diff-up'
                  : stats.diffFromPrevious < 0
                  ? 'diff-down'
                  : 'diff-neutral'
              }`}
            >
              {stats.diffFromPrevious > 0 ? '▲ +' : stats.diffFromPrevious < 0 ? '▼ ' : '● '}
              {formatCurrency(stats.diffFromPrevious, language)}
              {stats.diffPercent !== null && ` (${stats.diffPercent > 0 ? '+' : ''}${stats.diffPercent.toFixed(1)}%)`}
            </span>
          )}
        </div>

        <div className="summary-card">
          <span className="summary-label">{t.peakMonth}</span>
          <span className="summary-value">
            {stats.peakMonth ? formatCurrency(stats.peakMonth.amount, language) : '—'}
          </span>
          <span className="summary-subtext">
            {stats.peakMonth ? stats.peakMonth.label : '—'}
          </span>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="chart-card">
        {loading ? (
          <div className="chart-loading">
            <div className="spinner"></div>
            <p>{t.loading}</p>
          </div>
        ) : selectedBillIds.size === 0 ? (
          <div className="chart-empty-state">
            <p>{t.noSelectedBillsWarning}</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            {/* Y-Axis Guidelines */}
            <div className="chart-y-axis">
              <span>{formatCurrency(maxChartValue, language)}</span>
              <span>{formatCurrency(maxChartValue * 0.75, language)}</span>
              <span>{formatCurrency(maxChartValue * 0.5, language)}</span>
              <span>{formatCurrency(maxChartValue * 0.25, language)}</span>
              <span>{formatCurrency(0, language)}</span>
            </div>

            {/* Bars Area */}
            <div className="chart-bars-area">
              {/* Background Grid Lines */}
              <div className="chart-gridlines">
                <div className="gridline"></div>
                <div className="gridline"></div>
                <div className="gridline"></div>
                <div className="gridline"></div>
                <div className="gridline baseline"></div>
              </div>

              {/* Bars */}
              <div className="chart-bars-container">
                {processedSeries.map((item, idx) => {
                  const heightPercent = maxChartValue > 0 ? (item.paid / maxChartValue) * 100 : 0;
                  const isHovered = hoveredIndex === idx;

                  return (
                    <div
                      key={`${item.year}-${item.month}`}
                      className={`chart-bar-column ${item.isCurrentMonth ? 'is-current' : ''} ${
                        isHovered ? 'hovered' : ''
                      }`}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Bar Value Tooltip / Label */}
                      <div className="bar-value-label">
                        {item.paid > 0 ? formatCurrency(item.paid, language) : 'R$ 0'}
                      </div>

                      {/* Bar Track & Fill */}
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(heightPercent, 2)}%`,
                          }}
                        >
                          <div className="bar-fill-gloss"></div>
                        </div>
                      </div>

                      {/* X-Axis Label */}
                      <div className="bar-footer">
                        <span className="bar-month-label">{item.label}</span>
                        {item.isCurrentMonth && (
                          <span className="current-pill">{t.currentMonthBadge}</span>
                        )}
                      </div>

                      {/* Tooltip on Hover */}
                      {isHovered && (
                        <div className="chart-tooltip">
                          <div className="tooltip-header">
                            <strong>
                              {item.monthName} {item.year}
                            </strong>
                            {item.isCurrentMonth && (
                              <span className="badge-current">{t.currentMonthBadge}</span>
                            )}
                          </div>
                          <div className="tooltip-row">
                            <span>{t.paidAmountLabel}:</span>
                            <strong>{formatCurrency(item.paid, language)}</strong>
                          </div>
                          {item.expected > 0 && (
                            <div className="tooltip-row text-muted">
                              <span>{t.expectedAmountLabel}:</span>
                              <span>{formatCurrency(item.expected, language)}</span>
                            </div>
                          )}
                          {item.bills.length > 0 && (
                            <div className="tooltip-bills-list">
                              {item.bills.map((b) => (
                                <div key={b.billId} className="tooltip-bill-item">
                                  <span className="bill-item-name">{b.billTitle}:</span>
                                  <span className="bill-item-val">
                                    {formatCurrency(b.paidAmount, language)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      {processedSeries.length > 0 && selectedBillIds.size > 0 && (
        <div className="comparison-table-card">
          <h3>{t.breakdownTableTitle}</h3>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>{t.tableMonth}</th>
                  <th>{t.tablePaid}</th>
                  <th>{t.tableExpected}</th>
                  <th>{t.tableVariation}</th>
                </tr>
              </thead>
              <tbody>
                {processedSeries.map((item, idx) => {
                  const prevItem = idx > 0 ? processedSeries[idx - 1] : null;
                  let diff = null;
                  let pct = null;
                  if (prevItem) {
                    diff = item.paid - prevItem.paid;
                    if (prevItem.paid > 0) {
                      pct = (diff / prevItem.paid) * 100;
                    }
                  }

                  return (
                    <tr key={`${item.year}-${item.month}`} className={item.isCurrentMonth ? 'current-month-row' : ''}>
                      <td>
                        <strong>{item.monthName} / {item.year}</strong>
                        {item.isCurrentMonth && (
                          <span className="table-current-badge">{t.currentMonthBadge}</span>
                        )}
                      </td>
                      <td className="amount-col">
                        <strong>{formatCurrency(item.paid, language)}</strong>
                      </td>
                      <td className="amount-col text-muted">
                        {formatCurrency(item.expected, language)}
                      </td>
                      <td className="amount-col">
                        {diff === null ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span
                            className={
                              diff > 0 ? 'text-danger' : diff < 0 ? 'text-success' : 'text-muted'
                            }
                          >
                            {diff > 0 ? '+ ' : ''}
                            {formatCurrency(diff, language)}
                            {pct !== null && ` (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%)`}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
