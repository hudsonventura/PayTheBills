namespace Server.Domain.Models;

using Server.Domain.Enums;

public record BillOccurrence(
    Guid BillId,
    string BillTitle,
    decimal ExpectedAmount,
    BillFrequency Frequency,
    DateOnly DueDate,
    bool IsPaid,
    Guid? ExecutionId,
    DateOnly? PaymentDate,
    decimal? PaidAmount,
    string? Notes
);
