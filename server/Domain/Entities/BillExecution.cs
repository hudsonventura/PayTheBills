namespace Server.Domain.Entities;

public class BillExecution
{
    public Guid Id { get; private set; }
    public Guid BillId { get; private set; }
    public DateOnly PaymentDate { get; private set; }
    public decimal PaidAmount { get; private set; }
    public DateOnly? ReferenceDueDate { get; private set; }
    public string? Notes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    public Bill? Bill { get; private set; }

    private BillExecution() { }

    public BillExecution(
        Guid id,
        Guid billId,
        DateOnly paymentDate,
        decimal paidAmount,
        DateOnly? referenceDueDate = null,
        string? notes = null,
        DateTime? createdAtUtc = null)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Execution ID cannot be empty.", nameof(id));

        if (billId == Guid.Empty)
            throw new ArgumentException("Bill ID cannot be empty.", nameof(billId));

        if (paidAmount < 0)
            throw new ArgumentOutOfRangeException(nameof(paidAmount), "Paid amount cannot be negative.");

        Id = id;
        BillId = billId;
        PaymentDate = paymentDate;
        PaidAmount = paidAmount;
        ReferenceDueDate = referenceDueDate;
        Notes = notes?.Trim();
        CreatedAtUtc = createdAtUtc ?? DateTime.UtcNow;
    }
}
