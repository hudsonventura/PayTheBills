namespace Server.Domain.Entities;

using Server.Domain.Enums;

public class Bill
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public decimal ExpectedAmount { get; private set; }
    public BillFrequency Frequency { get; private set; }

    public DateOnly StartDate { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public int? DayOfMonth { get; private set; }
    public int? MonthOfYear { get; private set; }
    public int? IntervalMonths { get; private set; }

    public string? PaymentLink { get; private set; }


    public string? Notes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    public User? User { get; private set; }
    public List<BillExecution> Executions { get; private set; } = new();

    private Bill() { }

    public Bill(
        Guid id,
        Guid userId,
        string title,
        decimal expectedAmount,
        BillFrequency frequency,
        DateOnly startDate,
        DateOnly? dueDate = null,
        int? dayOfMonth = null,
        int? monthOfYear = null,
        int? intervalMonths = null,
        string? notes = null,
        DateTime? createdAtUtc = null,
        string? PaymentLink = null)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Bill ID cannot be empty.", nameof(id));

        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));

        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.", nameof(title));

        if (expectedAmount < 0)
            throw new ArgumentOutOfRangeException(nameof(expectedAmount), "Expected amount cannot be negative.");

        ValidateFrequencyParameters(frequency, startDate, dueDate, dayOfMonth, monthOfYear, intervalMonths);

        Id = id;
        UserId = userId;
        Title = title.Trim();
        ExpectedAmount = expectedAmount;
        Frequency = frequency;
        StartDate = startDate;
        DueDate = dueDate;
        DayOfMonth = dayOfMonth;
        MonthOfYear = monthOfYear;
        IntervalMonths = intervalMonths;
        Notes = notes?.Trim();
        CreatedAtUtc = createdAtUtc ?? DateTime.UtcNow;
        PaymentLink = PaymentLink;
    }

    private static void ValidateFrequencyParameters(
        BillFrequency frequency,
        DateOnly startDate,
        DateOnly? dueDate,
        int? dayOfMonth,
        int? monthOfYear,
        int? intervalMonths)
    {
        switch (frequency)
        {
            case BillFrequency.Once:
                if (!dueDate.HasValue)
                    throw new ArgumentException("Due date is required for one-time bills.", nameof(dueDate));
                break;

            case BillFrequency.Monthly:
                if (!dayOfMonth.HasValue || dayOfMonth.Value < 1 || dayOfMonth.Value > 31)
                    throw new ArgumentOutOfRangeException(nameof(dayOfMonth), "Day of month must be between 1 and 31.");
                break;

            case BillFrequency.EveryNMonths:
                if (!dayOfMonth.HasValue || dayOfMonth.Value < 1 || dayOfMonth.Value > 31)
                    throw new ArgumentOutOfRangeException(nameof(dayOfMonth), "Day of month must be between 1 and 31.");
                if (!intervalMonths.HasValue || intervalMonths.Value < 1)
                    throw new ArgumentOutOfRangeException(nameof(intervalMonths), "Interval months must be at least 1.");
                break;

            case BillFrequency.Yearly:
                if (!monthOfYear.HasValue || monthOfYear.Value < 1 || monthOfYear.Value > 12)
                    throw new ArgumentOutOfRangeException(nameof(monthOfYear), "Month of year must be between 1 and 12.");
                if (!dayOfMonth.HasValue || dayOfMonth.Value < 1 || dayOfMonth.Value > 31)
                    throw new ArgumentOutOfRangeException(nameof(dayOfMonth), "Day of month must be between 1 and 31.");
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(frequency), "Invalid frequency specified.");
        }
    }

    public void AddExecution(BillExecution execution)
    {
        ArgumentNullException.ThrowIfNull(execution);
        if (execution.BillId != Id)
            throw new ArgumentException("Execution does not belong to this bill.", nameof(execution));

        Executions.Add(execution);
    }
}
