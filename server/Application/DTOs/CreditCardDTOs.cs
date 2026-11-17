namespace Server.Application.DTOs;

public record CreateCreditCardRequest(
    string Name,
    string? Color,
    int ClosingDay,
    int DueDay
);

public record UpdateCreditCardRequest(
    string Name,
    string? Color,
    int ClosingDay,
    int DueDay
);

public record CreditCardResponse(
    Guid Id,
    string Name,
    string? Color,
    int ClosingDay,
    int DueDay,
    int ActivePurchasesCount,
    decimal TotalRemainingAmount,
    DateTime CreatedAtUtc
);

public record CreateCreditCardPurchaseRequest(
    Guid CreditCardId,
    string Title,
    DateOnly PurchaseDate,
    decimal TotalAmount,
    int TotalInstallments,
    DateOnly? FirstInstallmentMonth = null,
    decimal? InstallmentAmount = null,
    string? Notes = null
);

public record UpdateCreditCardPurchaseRequest(
    Guid CreditCardId,
    string Title,
    DateOnly PurchaseDate,
    decimal TotalAmount,
    int TotalInstallments,
    DateOnly FirstInstallmentMonth,
    decimal? InstallmentAmount = null,
    string? Notes = null
);

public record CreditCardPurchaseResponse(
    Guid Id,
    Guid CreditCardId,
    string CreditCardName,
    string? CreditCardColor,
    string Title,
    DateOnly PurchaseDate,
    decimal TotalAmount,
    int TotalInstallments,
    decimal InstallmentAmount,
    DateOnly FirstInstallmentMonth,
    string? Notes,
    int PaidInstallmentsCount,
    int RemainingInstallmentsCount,
    decimal RemainingAmount,
    bool IsCompleted,
    DateTime CreatedAtUtc
);

public record MonthlyInstallmentItemDto(
    Guid PurchaseId,
    string PurchaseTitle,
    Guid CreditCardId,
    string CreditCardName,
    string? CreditCardColor,
    int InstallmentNumber,
    int TotalInstallments,
    decimal InstallmentAmount
);

public record MonthlyInstallmentSummaryDto(
    int Year,
    int Month,
    int ActivePurchasesCount,
    decimal TotalAmount,
    List<MonthlyInstallmentItemDto> Items
);

public record InstallmentGanttItemDto(
    Guid Id,
    string Title,
    Guid CreditCardId,
    string CreditCardName,
    string? CreditCardColor,
    DateOnly PurchaseDate,
    decimal TotalAmount,
    int TotalInstallments,
    decimal InstallmentAmount,
    DateOnly FirstInstallmentMonth,
    DateOnly LastInstallmentMonth,
    int CurrentInstallmentNumber,
    int RemainingInstallments,
    decimal RemainingAmount,
    bool IsCompleted
);

public record CreditCardTimelineResponse(
    DateOnly ReferenceMonth,
    DateOnly? FinalMonth,
    int TotalActivePurchases,
    decimal TotalRemainingAmount,
    decimal CurrentMonthTotal,
    List<MonthlyInstallmentSummaryDto> MonthlySummaries,
    List<InstallmentGanttItemDto> GanttItems
);
