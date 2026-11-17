import React, { useState } from 'react';
import { type Language, translations } from '../i18n';
import { type CreditCard, type CreateCreditCardPayload, type UpdateCreditCardPayload } from '../api';

interface CreditCardModalProps {
  language: Language;
  card?: CreditCard | null;
  onSave: (data: CreateCreditCardPayload | UpdateCreditCardPayload) => Promise<void>;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#8A05BE', // Nubank Purple
  '#0056B3', // Visa Blue
  '#EB001B', // Mastercard Red
  '#107C41', // Emerald Green
  '#E65100', // Deep Orange
  '#1E293B', // Dark Slate
  '#D97706', // Gold / Amber
  '#4F46E5', // Indigo
];

export const CreditCardModal: React.FC<CreditCardModalProps> = ({
  language,
  card,
  onSave,
  onClose,
}) => {
  const t = translations[language];

  const [name, setName] = useState(card?.name ?? '');
  const [color, setColor] = useState(card?.color ?? '#8A05BE');
  const [closingDay, setClosingDay] = useState(card?.closingDay ?? 20);
  const [dueDay, setDueDay] = useState(card?.dueDay ?? 27);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(language === 'pt' ? 'O nome do cartão é obrigatório.' : 'Card name is required.');
      return;
    }

    if (closingDay < 1 || closingDay > 31) {
      setError(language === 'pt' ? 'O dia de fechamento deve ser entre 1 e 31.' : 'Closing day must be between 1 and 31.');
      return;
    }

    if (dueDay < 1 || dueDay > 31) {
      setError(language === 'pt' ? 'O dia de vencimento deve ser entre 1 e 31.' : 'Due day must be between 1 and 31.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        closingDay,
        dueDay,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving credit card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content card-modal">
        <div className="modal-header">
          <h3>{card ? t.editCard : t.addCard}</h3>
          <button type="button" className="close-btn" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="card-name">{t.cardName} *</label>
            <input
              id="card-name"
              type="text"
              className="form-control"
              placeholder={language === 'pt' ? 'Ex: Nubank, Itaú Mastercard, XP...' : 'e.g. Nubank, Chase Sapphire...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>{t.cardColor}</label>
            <div className="color-palette-selector">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-chip ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
              <input
                type="color"
                className="color-input-native"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Cor customizada"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col">
              <label htmlFor="card-closing">{t.closingDay} *</label>
              <input
                id="card-closing"
                type="number"
                min="1"
                max="31"
                className="form-control"
                value={closingDay}
                onChange={(e) => setClosingDay(Number(e.target.value))}
                required
                disabled={loading}
              />
              <small className="form-hint">
                {language === 'pt' ? 'Melhor dia de compra é o dia seguinte' : 'Best purchase date is day after'}
              </small>
            </div>

            <div className="form-group col">
              <label htmlFor="card-due">{t.dueDay} *</label>
              <input
                id="card-due"
                type="number"
                min="1"
                max="31"
                className="form-control"
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                required
                disabled={loading}
              />
              <small className="form-hint">
                {language === 'pt' ? 'Data limite para pagamento' : 'Payment deadline day'}
              </small>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="card-preview" style={{ backgroundColor: color }}>
            <div className="card-preview-chip" />
            <div className="card-preview-name">{name || (language === 'pt' ? 'Nome do Cartão' : 'Card Name')}</div>
            <div className="card-preview-details">
              <span>{language === 'pt' ? `Fecha: dia ${closingDay}` : `Closes: day ${closingDay}`}</span>
              <span>{language === 'pt' ? `Vence: dia ${dueDay}` : `Due: day ${dueDay}`}</span>
            </div>
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
