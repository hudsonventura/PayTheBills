namespace Server.Application.DTOs;

using Server.Domain.Enums;
using Server.Domain.Models;

public record CreateBillRequest(
    string Title,
    decimal ExpectedAmount,
    BillFrequency Frequency,
    DateOnly StartDate,
    DateOnly? DueDate = null,
    int? DayOfMonth = null,
    int? MonthOfYear = null,
    int? IntervalMonths = null,
    string? Notes = null
);

public record BillResponse(
    Guid Id,
    Guid UserId,
    string Title,
    decimal ExpectedAmount,
    BillFrequency Frequency,
    DateOnly StartDate,
    DateOnly? DueDate,
    int? DayOfMonth,
    int? MonthOfYear,
    int? IntervalMonths,
    string? Notes,
    DateTime CreatedAtUtc
);

public record BillOccurrenceResponse(
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

public record RegisterExecutionRequest(
    DateOnly PaymentDate,
    decimal PaidAmount,
    DateOnly? ReferenceDueDate = null,
    string? Notes = null
);

public record BillExecutionResponse(
    Guid Id,
    Guid BillId,
    DateOnly PaymentDate,
    decimal PaidAmount,
    DateOnly? ReferenceDueDate,
    string? Notes,
    DateTime CreatedAtUtc
);
