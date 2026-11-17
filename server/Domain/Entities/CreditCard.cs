namespace Server.Domain.Entities;

public class CreditCard
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Color { get; private set; }
    public int ClosingDay { get; private set; }
    public int DueDay { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    public User? User { get; private set; }
    public List<CreditCardPurchase> Purchases { get; private set; } = new();

    private CreditCard() { }

    public CreditCard(
        Guid id,
        Guid userId,
        string name,
        string? color,
        int closingDay,
        int dueDay,
        DateTime? createdAtUtc = null)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Credit card ID cannot be empty.", nameof(id));

        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Credit card name cannot be empty.", nameof(name));

        if (closingDay < 1 || closingDay > 31)
            throw new ArgumentOutOfRangeException(nameof(closingDay), "Closing day must be between 1 and 31.");

        if (dueDay < 1 || dueDay > 31)
            throw new ArgumentOutOfRangeException(nameof(dueDay), "Due day must be between 1 and 31.");

        Id = id;
        UserId = userId;
        Name = name.Trim();
        Color = string.IsNullOrWhiteSpace(color) ? null : color.Trim();
        ClosingDay = closingDay;
        DueDay = dueDay;
        CreatedAtUtc = createdAtUtc ?? DateTime.UtcNow;
    }

    public void Update(
        string name,
        string? color,
        int closingDay,
        int dueDay)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Credit card name cannot be empty.", nameof(name));

        if (closingDay < 1 || closingDay > 31)
            throw new ArgumentOutOfRangeException(nameof(closingDay), "Closing day must be between 1 and 31.");

        if (dueDay < 1 || dueDay > 31)
            throw new ArgumentOutOfRangeException(nameof(dueDay), "Due day must be between 1 and 31.");

        Name = name.Trim();
        Color = string.IsNullOrWhiteSpace(color) ? null : color.Trim();
        ClosingDay = closingDay;
        DueDay = dueDay;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
