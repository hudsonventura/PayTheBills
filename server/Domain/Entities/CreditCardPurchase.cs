namespace Server.Domain.Entities;

public class CreditCardPurchase
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid CreditCardId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public DateOnly PurchaseDate { get; private set; }
    public decimal TotalAmount { get; private set; }
    public int TotalInstallments { get; private set; }
    public decimal InstallmentAmount { get; private set; }
    public DateOnly FirstInstallmentMonth { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    public User? User { get; private set; }
    public CreditCard? CreditCard { get; private set; }

    private CreditCardPurchase() { }

    public CreditCardPurchase(
        Guid id,
        Guid userId,
        Guid creditCardId,
        string title,
        DateOnly purchaseDate,
        decimal totalAmount,
        int totalInstallments,
        DateOnly firstInstallmentMonth,
        decimal? installmentAmount = null,
        string? notes = null,
        DateTime? createdAtUtc = null)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Purchase ID cannot be empty.", nameof(id));

        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        if (creditCardId == Guid.Empty)
            throw new ArgumentException("Credit Card ID cannot be empty.", nameof(creditCardId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Purchase title cannot be empty.", nameof(title));

        if (totalAmount <= 0)
            throw new ArgumentOutOfRangeException(nameof(totalAmount), "Total amount must be greater than zero.");

        if (totalInstallments < 1)
            throw new ArgumentOutOfRangeException(nameof(totalInstallments), "Total installments must be at least 1.");

        var instAmount = installmentAmount ?? Math.Round(totalAmount / totalInstallments, 2, MidpointRounding.AwayFromZero);
        if (instAmount <= 0)
            throw new ArgumentOutOfRangeException(nameof(installmentAmount), "Installment amount must be greater than zero.");

        Id = id;
        UserId = userId;
        CreditCardId = creditCardId;
        Title = title.Trim();
        PurchaseDate = purchaseDate;
        TotalAmount = totalAmount;
        TotalInstallments = totalInstallments;
        InstallmentAmount = instAmount;
        FirstInstallmentMonth = new DateOnly(firstInstallmentMonth.Year, firstInstallmentMonth.Month, 1);
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        CreatedAtUtc = createdAtUtc ?? DateTime.UtcNow;
    }

    public void Update(
        Guid creditCardId,
        string title,
        DateOnly purchaseDate,
        decimal totalAmount,
        int totalInstallments,
        DateOnly firstInstallmentMonth,
        decimal? installmentAmount = null,
        string? notes = null)
    {
        if (creditCardId == Guid.Empty)
            throw new ArgumentException("Credit Card ID cannot be empty.", nameof(creditCardId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Purchase title cannot be empty.", nameof(title));

        if (totalAmount <= 0)
            throw new ArgumentOutOfRangeException(nameof(totalAmount), "Total amount must be greater than zero.");

        if (totalInstallments < 1)
            throw new ArgumentOutOfRangeException(nameof(totalInstallments), "Total installments must be at least 1.");

        var instAmount = installmentAmount ?? Math.Round(totalAmount / totalInstallments, 2, MidpointRounding.AwayFromZero);
        if (instAmount <= 0)
            throw new ArgumentOutOfRangeException(nameof(installmentAmount), "Installment amount must be greater than zero.");

        CreditCardId = creditCardId;
        Title = title.Trim();
        PurchaseDate = purchaseDate;
        TotalAmount = totalAmount;
        TotalInstallments = totalInstallments;
        InstallmentAmount = instAmount;
        FirstInstallmentMonth = new DateOnly(firstInstallmentMonth.Year, firstInstallmentMonth.Month, 1);
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
